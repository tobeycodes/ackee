use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Ticket {
    pub numbers: [u8; 6],

    pub bump: u8,
}
