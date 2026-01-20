use crate::{error::ErrorCode, Lottery, Ticket, LOTTERY_SEED, TICKET_SEED};
use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Purchase<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [LOTTERY_SEED, id.to_le_bytes().as_ref()], 
        bump = lottery.bump,
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        init,
        payer = authority,
        space = Ticket::INIT_SPACE + Ticket::DISCRIMINATOR.len(),
        seeds = [TICKET_SEED, lottery.key().as_ref(), authority.key().as_ref()], 
        bump,
    )]
    pub ticket: Account<'info, Ticket>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Purchase>, _id: u64, numbers: [u8; 6]) -> Result<()> {
    require!(ctx.accounts.lottery.is_active, ErrorCode::LotteryNotActive);

    for &number in &numbers {
        require!(number >= 1 && number <= 10, ErrorCode::LotteryInvalidNumbers);
    }

    let mut unique_numbers = numbers.to_vec();
    unique_numbers.sort_unstable();
    unique_numbers.dedup();
    require!(unique_numbers.len() == numbers.len(), ErrorCode::LotteryInvalidNumbers);

    require!(
        ctx.accounts.lottery.sold < 100,
        ErrorCode::LotterySoldOut
    );

    ctx.accounts.ticket.set_inner(Ticket {
        numbers,
        bump: ctx.bumps.ticket,
    });

    ctx.accounts.lottery.holders.push(ctx.accounts.ticket.key());
    ctx.accounts.lottery.sold += 1;

    invoke(
        &transfer(
            ctx.accounts.authority.key,
            ctx.accounts.lottery.to_account_info().key,
            ctx.accounts.lottery.price,
        ),
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.lottery.to_account_info(),
        ],
    )?;

    Ok(())
}
