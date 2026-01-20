use crate::{Lottery, LOTTERY_SEED};
use anchor_lang::prelude::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Draw<'info> {
    #[account(signer)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [LOTTERY_SEED, id.to_le_bytes().as_ref()], 
        bump = lottery.bump,
        has_one = authority,
    )]
    pub lottery: Account<'info, Lottery>,
}

pub fn handler(ctx: Context<Draw>, _id: u64) -> Result<()> {
    require!(ctx.accounts.lottery.is_active, ErrorCode::LotteryNotActive);
    require!(ctx.accounts.lottery.sold > 0, ErrorCode::LotteryNoTicketsSold);

    #[cfg(feature = "testing")]
    let numbers = [1, 2, 3, 4, 5, 6];

    #[cfg(not(feature = "testing"))]
    let numbers = {
        let clock = Clock::get()?;
        let seed = clock.slot.wrapping_mul(clock.unix_timestamp as u64);
        [
            ((seed % 10) + 1) as u8,
            (((seed / 7) % 10) + 1) as u8,
            (((seed / 13) % 10) + 1) as u8,
            (((seed / 17) % 10) + 1) as u8,
            (((seed / 23) % 10) + 1) as u8,
            (((seed / 29) % 10) + 1) as u8,
        ]
    };

    ctx.accounts.lottery.numbers = Some(numbers);
    ctx.accounts.lottery.is_active = false;

    Ok(())
}
