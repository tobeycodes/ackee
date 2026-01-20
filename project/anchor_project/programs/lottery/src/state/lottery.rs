use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Lottery {
    pub authority: Pubkey,

    pub id: u64,

    #[max_len(100)]
    pub holders: Vec<Pubkey>,

    pub sold: u32,

    pub price: u64,

    pub is_active: bool,

    pub is_claimed: bool,

    pub numbers: Option<[u8; 6]>,

    pub bump: u8,
}
