use crate::error::ErrorCode;
use crate::{Lottery, Ticket, LOTTERY_SEED, TICKET_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Claim<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [LOTTERY_SEED, id.to_le_bytes().as_ref()], 
        bump = lottery.bump,
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        seeds = [TICKET_SEED, lottery.key().as_ref(), authority.key().as_ref()], 
        bump,
    )]
    pub ticket: Account<'info, Ticket>,
}

pub fn handler(ctx: Context<Claim>, _id: u64) -> Result<()> {
    let lottery = &ctx.accounts.lottery;
    let ticket = &ctx.accounts.ticket;

    require!(!lottery.is_active, ErrorCode::LotteryIsActive);
    require!(!lottery.is_claimed, ErrorCode::LotteryAlreadyClaimed);
    require!(lottery.numbers.is_some(), ErrorCode::LotteryNumbersNotDrawn);
    require!(
        lottery.numbers.unwrap() == ticket.numbers,
        ErrorCode::LotteryNumbersDoNotMatch
    );

    let lottery_balance = lottery.to_account_info().lamports();
    let rent = Rent::get()?.minimum_balance(lottery.to_account_info().data_len());
    let available = lottery_balance.saturating_sub(rent);

    ctx.accounts.lottery.is_claimed = true;

    **ctx
        .accounts
        .lottery
        .to_account_info()
        .try_borrow_mut_lamports()? -= available;

    **ctx
        .accounts
        .authority
        .to_account_info()
        .try_borrow_mut_lamports()? += available;


    Ok(())
}
