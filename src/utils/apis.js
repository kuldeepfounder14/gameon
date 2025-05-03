// const baseUrlTirangaWin = "https://root.tirangawin.club/";
// const configModalTirangaWin = `${baseUrlTirangaWin}api/`
// import REACT_APP_API_URL from ""
export const baseUrlUsaWin =import.meta.env.VITE_API_URL;

;
const configModalUsaWin = `${baseUrlUsaWin}/api/`
// const baseUrlmobileappdemo = "https://tiranga.mobileappdemo.net/";
// const configModalMobileappdemo = `${baseUrlmobileappdemo}api/`

// const baseUrlCodingjourney = "// https://root.codingjourney.in/";
// const configModalCodingjourney = `${baseUrlCodingjourney}api/`

const apis = {
  sendOtp: "https://otp.fctechteam.org/send_otp.php?mode=live&digit=4&mobile=",
  verifyOtp: "https://otp.fctechteam.org/verifyotp.php",
  createUserId: `${configModalUsaWin}otp-register`,
  register: `${configModalUsaWin}register`,
  login: `${configModalUsaWin}login`,
  profile: `${configModalUsaWin}profile?id=`,
  changePassword: `${configModalUsaWin}changePassword`,
  fundTransfer: `${configModalUsaWin}main_wallet_transfers`,
  //plinko game urls
  plinko_bet: `${configModalUsaWin}plinko_bet`,
  plinko_index_list: `${configModalUsaWin}plinko_index_list?type=`,
  plinko_result: `${configModalUsaWin}plinko_result?userid=`,
  plinko_multiplier: `${configModalUsaWin}plinko_multiplier`,


  wingo_bet: `${configModalUsaWin}bets`,
  wingo_my_history: `${configModalUsaWin}bet_history`,
  wingo_game_history: `${configModalUsaWin}results`,
  wingo_win_amount_announcement: `${configModalUsaWin}win-amount`,
  get_result_trx: `${configModalUsaWin}get_result`,


  dragon_bet: `${configModalUsaWin}dragon_bet`,
  dragonBet_history: `${configModalUsaWin}bet_history`,
  dragonResults: `${configModalUsaWin}results`,

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



// https://k3games.mobileappdemo.net/api/bet

// {
//   "userid": 1,
//   "game_id": 18,
//   "gamesno":"111111",
//   "bets": [
//     {
//       "number": 222,
//       "amount": 200
//     },
//     {
//       "number": 77,
//       "amount": 120
//     }
//   ]
// }

//https://k3games.mobileappdemo.net/api/bet_history?userid=2&game_id=18&limit_offset=2
//https://k3games.mobileappdemo.net/api/bet_result?userid=2&game_id=18&limit_offset=5