// const baseUrlTirangaWin = "https://root.tirangawin.club/";
// const configModalTirangaWin = `${baseUrlTirangaWin}api/`
// import REACT_APP_API_URL from ""
// export const baseUrlUsaWin =import.meta.env.VITE_API_URL;
export const baseUrlUsaWin = "https://root.gameon.deals";
export const configModalUsaWin = `${baseUrlUsaWin}/api/`

const apis = {
  sendOtp: "https://otp.fctechteam.org/send_otp.php?mode=live&digit=4&mobile=",
  verifyOtp: "https://otp.fctechteam.org/verifyotp.php",
  createUserId: `${configModalUsaWin}otp-register`,
  register: `${configModalUsaWin}register`,
  login: `${configModalUsaWin}login`,
  profile: `${configModalUsaWin}profile?id=`,
  changePassword: `${configModalUsaWin}changePassword`,
  fundTransfer: `${configModalUsaWin}main_wallet_transfers`,

  //spin to wheel game urls
  spin_bet: `${configModalUsaWin}spin/bet`,
  spin_result: `${configModalUsaWin}spin/result`,
  spin_betHistory: `${configModalUsaWin}spin/bet_history`,
  // keno_multiplier: `${configModalUsaWin}keno_multiplier`,

  //keno game urls
  keno_bet: `${configModalUsaWin}keno-bet`,
  keno_result: `${configModalUsaWin}keno_result`,
  keno_betHistory: `${configModalUsaWin}keno-bet-history`,
  keno_multiplier: `${configModalUsaWin}keno_multiplier`,
  keno_win_amount: `${configModalUsaWin}keno-win-amount`,

  //plinko game urls
  plinko_bet: `${configModalUsaWin}plinko_bet`,
  plinko_index_list: `${configModalUsaWin}plinko_index_list?type=`,
  plinko_result: `${configModalUsaWin}plinko_result?userid=`,
  plinko_multiplier: `${configModalUsaWin}plinko_multiplier`,

  //heads n tails game urls
  headsntails_bet: `${configModalUsaWin}bets`,
  headsntails_history: `${configModalUsaWin}bet_history`,
  headsntails_result: `${configModalUsaWin}results?game_id=14&limit=8`,
  results_api_sno: `${configModalUsaWin}results?game_id=14&limit=1`,

  wingo_bet: `${configModalUsaWin}bets`,
  wingo_my_history: `${configModalUsaWin}bet_history`,
  wingo_game_history: `${configModalUsaWin}results`,
  wingo_win_amount_announcement: `${configModalUsaWin}win-amount`,
  get_result_trx: `${configModalUsaWin}get_result`,

  mines_bet: `${configModalUsaWin}mine_bet`,
  mines_cashout: `${configModalUsaWin}mine_cashout`,
  mines_result: `${configModalUsaWin}mine_result?userid=`,
  mines_multiplier: `${configModalUsaWin}mine_multiplier`,

  dragon_bet: `${configModalUsaWin}dragon_bet`,
  dragonBet_history: `${configModalUsaWin}bet_history`,
  dragonResults: `${configModalUsaWin}results`,

  dice_bet: `${configModalUsaWin}dragon_bet`,
  dice_Bet_history: `${configModalUsaWin}bet_history`,
  dice_Results: `${configModalUsaWin}results`,
  dice_win_amount: `${configModalUsaWin}win-amount`,

  rednblack_bet: `${configModalUsaWin}dragon_bet`,
  rednblack_Bet_history: `${configModalUsaWin}bet_history`,
  rednblack_Results: `${configModalUsaWin}results`,
  rednblack_win_amount: `${configModalUsaWin}win-amount`,
  // seven up down
  sevenUpDown_bet: `${configModalUsaWin}dragon_bet`,
  sevenUpDown_Bet_history: `${configModalUsaWin}bet_history`,
  sevenUpDown_Results: `${configModalUsaWin}results`,
  sevenUpDown_win_amount: `${configModalUsaWin}win-amount`,
  // jhand munda
  jhandiMunda_bet: `${configModalUsaWin}dragon_bet`,
  jhandiMunda_Bet_history: `${configModalUsaWin}bet_history`,
  jhandiMunda_Results: `${configModalUsaWin}results`,
  jhandiMunda_win_amount: `${configModalUsaWin}win-amount`,

  // high low 
  high_low_bet: `${configModalUsaWin}high_low_bet`,


  payin_deposit: `${configModalUsaWin}payin`,
  payin_deposit_usdt: `${configModalUsaWin}usdt_payin`,
  payin_deposit_camlenio: `${configModalUsaWin}camlenio?user_id=`,
  depositHistory: `${configModalUsaWin}deposit_history`,
  addAccount: `${configModalUsaWin}add_account`,
  accountView: `${configModalUsaWin}Account_view`,
  payout_withdraw: `${configModalUsaWin}withdraw`,
  usdtpayout_withdraw: `${configModalUsaWin}usdtwithdraw`,
  withdrawHistory: `${configModalUsaWin}withdraw_history`,
  promotionData: `${configModalUsaWin}agency-promotion-data-`,
  subordinateData: `${configModalUsaWin}subordinate-data`,
  commisionDetails: `${configModalUsaWin}commission_details?userid=`,
  tier: `${configModalUsaWin}tier`,
  vipLevel: `${configModalUsaWin}vip_level?userid=`,
  vipLevelHistory: `${configModalUsaWin}vip_level_history?userid=`,
  vipLevelAddMoney: `${configModalUsaWin}add_money`,
  redeemGift: `${configModalUsaWin}gift_cart_apply`,
  redeemGiftList: `${configModalUsaWin}gift_redeem_list?userid=`,
  gameStatsHistory: `${configModalUsaWin}total_bet_details?userid=`,
  activityRewards: `${configModalUsaWin}activity_rewards?userid=`,
  activityRewardsClaim: `${configModalUsaWin}activity_rewards_claim`,
  activityRewardsHistory: `${configModalUsaWin}activity_rewards_history?user_id=`,
  attendanceList: `${configModalUsaWin}attendance_List?userid=`,
  attendanceHistory: `${configModalUsaWin}attendance_history?userid=`,
  attendanceClaim: `${configModalUsaWin}attendance_claim`,
  slider: `${configModalUsaWin}slider`,
  invitation_bonus_list: `${configModalUsaWin}invitation_bonus_list?userid=`,
  invitation_bonus_claim: `${configModalUsaWin}invitation_bonus_claim`,
  transaction_history_list: `${configModalUsaWin}transaction_history_list`,
  transaction_history: `${configModalUsaWin}transaction_history?userid=`,
  Invitation_records: `${configModalUsaWin}Invitation_records?userid=`,
  update_profile: `${configModalUsaWin}update_profile`,
  allAvatar: `${configModalUsaWin}image_all`,
  customer_service: `${configModalUsaWin}customer_service`,
  about_us: `${configModalUsaWin}about_us?type=`,
  newSubordinate: `${configModalUsaWin}new-subordinate?id=`,
  payModes: `${configModalUsaWin}pay_modes`,
  account_update: `${configModalUsaWin}account_update/`,
  country: `${configModalUsaWin}country`,
  betting_rebate_history: `${configModalUsaWin}betting_rebate_history?userid=`,
  add_usdt_account: `${configModalUsaWin}add_usdt_account`,
  usdt_account_view: `${configModalUsaWin}usdt_account_view?user_id=`,
  wingo_rules: `${configModalUsaWin}wingo_rules?type=`,
  getPaymentLimits: `${configModalUsaWin}getPaymentLimits`,
  all_game_list: `${configModalUsaWin}all_game_list`,
  get_game_url: `${configModalUsaWin}get_game_url`,
  all_game_list_spribe: `${configModalUsaWin}get_reseller_info`,
  get_game_url_spribe: `${configModalUsaWin}get_spribe_game_urls`,
  extra_first_deposit_bonus: `${configModalUsaWin}extra_first_deposit_bonus?userid=`,
  getBranchnameByIfsc: `${configModalUsaWin}get-ifsc-details?ifsc=`,
  trx_game_result: `${configModalUsaWin}trx/result`,
  update_jilli_wallet: `${configModalUsaWin}update_jilli_wallet`,
  update_jilli_to_user_wallet: `${configModalUsaWin}update_jilli_to_user_wallet`,
  update_spribe_wallet: `${configModalUsaWin}update_spribe_wallet`,
  update_spribe_to_user_wallet: `${configModalUsaWin}update_spribe_to_user_wallet`,
};

export default apis


// [13:54, 10/5/2025] Akhilesh K Yadav FC: https://admin.gameon.deals/api/spin/bet
// {
//   "user_id": 1,
//   "bets": [
//     {
//       "game_id": 1,
//       "amount": 5
//     },
//     {
//       "game_id": 2,
//       "amount": 30
//     }
//   ]
// }


// https://admin.gameon.deals/api/spin/bet_history?user_id=1&limit=4

// https://admin.gameon.deals/api/spin/result?user_id=1

// @Er. Kuldeep Verma🤔  spin2win gameon.deals api
// [13:55, 10/5/2025] Akhilesh K Yadav FC: spinto win event name- gameon_spin