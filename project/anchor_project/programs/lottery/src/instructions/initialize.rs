use crate::{Lottery, LOTTERY_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Initialize<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Lottery::INIT_SPACE + Lottery::DISCRIMINATOR.len(),
        seeds = [LOTTERY_SEED, id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub lottery: Account<'info, Lottery>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, id: u64) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);

    ctx.accounts.lottery.set_inner(Lottery {
        authority: ctx.accounts.authority.key(),
        id,
        holders: Vec::new(),
        sold: 0,
        price: 1_000_000,
        is_active: true,
        is_claimed: false,
        numbers: None,
        bump: ctx.bumps.lottery,
    });

    Ok(())
}
