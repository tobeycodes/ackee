use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid numbers: Numbers must be between 1 and 10 and unique")]
    LotteryInvalidNumbers,

    #[msg("The lottery is not active")]
    LotteryNotActive,

    #[msg("The lottery is still active")]
    LotteryIsActive,

    #[msg("The lottery has already been claimed")]
    LotteryAlreadyClaimed,

    #[msg("The lottery numbers have not been drawn yet")]
    LotteryNumbersNotDrawn,

    #[msg("The lottery numbers do not match")]
    LotteryNumbersDoNotMatch,

    #[msg("The lottery is sold out")]
    LotterySoldOut,

    #[msg("No lottery tickets have been sold")]
    LotteryNoTicketsSold,
}
