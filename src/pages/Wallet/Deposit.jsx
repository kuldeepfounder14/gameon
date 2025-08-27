import { HiArrowPathRoundedSquare } from 'react-icons/hi2'
import usdt_icon from '../../assets/images/usdt_icon.png'
import depo_wallet from '../../assets/icons/depo_wallet.png'
import { useEffect, useState } from 'react';
import { RxCrossCircled } from 'react-icons/rx';
import camlenios from "../../assets/usaAsset/wallet/camlenios.png"
import indianpay from "../../assets/usaAsset/wallet/indianpay.png"
// import upi from "../../assets/usaAsset/wallet/upi.png"
// import paytm from "../../assets/usaAsset/wallet/paytm.png"
import rechargeIns from "../../assets/usaAsset/wallet/rechargeIns.png"
import save_wallet from "../../assets/usaAsset/wallet/save_wallet.png"
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import apis from '../../utils/apis'
import withdrawBg from "../../assets/usaAsset/wallet/withdrawBg.png"
import Loader from '../../reusable_component/Loader/Loader';
import { data } from 'autoprefixer';
import Connection from '../../features/ethereum/Connection';

const profileApi = apis.profile
function Deposit() {
    const {
        currentAccount,
        connectWallet,
        balance,
        tokenSymbol,
        betAmount,
        setBetAmount,
        placeBet
    } = Connection();
    const [loading, setloading] = useState(false);
    const [paymenLimts, setPaymenLimts] = useState({})
    const [amountError, setAmountError] = useState("");
    const [amountErrorUSDT, setAmountErrorUSDT] = useState("");
    const [amountErrorCamilino, setAmountErrorCamilino] = useState("");
    const [activeModal, setActiveModal] = useState(1);
    // const [payModesList, setPayModesList] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState(200);
    const [selectedAmountCamilino, setSelectedAmountCamilino] = useState(1);
    const [USDTselectedAmount, setUSDTSelectAmount] = useState(10);
    const [upiAmount, setUpiAmount] = useState(selectedAmount);
    const [upiAmountCamilino, setUpiAmountCamilino] = useState(selectedAmountCamilino);
    const [usdtAmount, setUsdtAmount] = useState(USDTselectedAmount)
    const depositArray = ["200", "300", "500", "1000", "5000", "10000", "20000", "50000", "100000"]
    // const depositArrayKuberPay = ["10000", "15000", "20000", "30000", "50000", "100000"]
    const USDTDepositArray = ["10", "20", "50", "100", "200", "500", "1000", "2000", "5000"]
    const [myDetails, setMyDetails] = useState(null)
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const getPaymentLimits = async () => {
        setloading(true)
        try {
            const res = await axios.get(`${apis.getPaymentLimits}`);
            if (res?.data?.status === 200) {
                setloading(false)
                setPaymenLimts(res?.data?.data)
            }
        } catch (err) {
            setloading(false)
            toast.error(err);
        }
    };
    // console.log("amount", paymenLimts)
    const validateAmount = (amount) => {
        if (!paymenLimts) return;
        let minAmount, maxAmount;
        if (activeModal == 0) {
            minAmount = paymenLimts?.USDT_minimum_deposit;
            maxAmount = paymenLimts?.USDT_maximum_deposit;
        } else if (activeModal == 1) {
            minAmount = paymenLimts?.kuber_pay_minimum_deposit
            maxAmount = paymenLimts?.kuber_pay_maximum_deposit
        } else {
            minAmount = 0;
            maxAmount = 1000;
        }
        amount = Number(amount);
        if (isNaN(amount) || amount < minAmount || amount > maxAmount) {
            setAmountError(`Amount must be between ${minAmount} - ${maxAmount}`);
            setAmountErrorUSDT(`Amount must be between $${minAmount} - $${maxAmount}`);
            setAmountErrorCamilino(`Amount must be between $${minAmount} - $${maxAmount}`);
        } else {
            setAmountError("");
            setAmountErrorUSDT("");
            setAmountErrorCamilino("");
        }
    };
    useEffect(() => {
        if (activeModal == 0) {
            validateAmount(usdtAmount);
            // console.log("usdtAmountusdtAmount", usdtAmount)
        } else if (activeModal == 1) {
            validateAmount(upiAmount);
            // console.log("upiAmount", upiAmount)
        } else {
            validateAmount(upiAmountCamilino)
        }
    }, [activeModal]);
    const profileDetails = async (userId) => {
        if (!userId) {
            toast.error("User not logged in");
            navigate("/login");
            return;
        }
        try {
            const res = await axios.get(`${profileApi}${userId}`);
            if (res?.data?.success === 200) {
                setMyDetails(res?.data)
            }
        } catch (err) {
            toast.error(err);
        }
    };

    useEffect(() => {
        getPaymentLimits()
    }, [])

    const payin_deposit = async () => {
        setloading(true)
        if (!userId) {
            toast.error("User not logged in");
            navigate("/login");
            return;
        }
        const amount = String(upiAmount)
        const ethereumRes = await placeBet(amount);
        // console.log("ethereumRes", ethereumRes?.hash, ethereumRes?.status)
        // if (ethereumRes) {
        //     toast.error("Ethereum bet failed");
        //     return;
        // }
        const hashID = ethereumRes?.hash
        const payload = {
            user_id: userId,
            amount: upiAmount,
            hash_id: hashID,
            status: 1
        }
        const apiIndianPay = apis.payin_deposit

        // console.log("payload", payload)
        try {
            let res = await axios.post(apiIndianPay, payload)

            // console.log("res", res)
            if (res?.data?.status === true || res?.data?.status === "200" || res?.data?.status === 200 || res?.data?.status === "SUCCESS") {
                profileDetails(userId)
                connectWallet()
                setloading(false)
            }
        } catch (er) {
            // console.log("ethereum", er)
            if (er?.response?.data?.status === 500) {
                console.log("err", er)
            } else {
                toast.error(er)
            }
        } finally {
            setloading(false)
        }
    }
    useEffect(() => {
        if (userId) {
            profileDetails(userId);
        }
        connectWallet()
    }, [userId]);

    const handleSelectAmount = (amount) => {
        const numericAmount = Number(amount);
        setSelectedAmount(numericAmount);
        setUpiAmount(numericAmount);
        validateAmount(numericAmount);
    };
    const handleSelectAmountCamilino = (amount) => {
        const numericAmount = Number(amount);
        setSelectedAmountCamilino(numericAmount);
        setUpiAmountCamilino(numericAmount);
        validateAmount(numericAmount);
    };

    const handleUSDTSelectAmount = (amount) => {
        const numericAmount = Number(amount);
        setUSDTSelectAmount(numericAmount);
        setUsdtAmount(numericAmount);
        validateAmount(numericAmount);
    };


    const toggleModal = (modalType) => {
        setActiveModal(modalType);
        setAmountError("");
        setAmountErrorUSDT("");
    };

    return (
        <div className='mx-3'>
            {loading == true && <Loader setloading={setloading} loading={loading} />}
            <div className='h-40 w-full flex items-center justify-between object-fill bg-no-repeat  rounded-lg p-2'
                style={{
                    backgroundImage: `url(${withdrawBg})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                }}
            >
                <div>
                    <p className='flex items-center gap-4'>
                        <p><img className='w-5 h-5' src={depo_wallet} alt="ds" /></p>
                        <p>Balance</p>
                    </p>
                    <p className='mt-2 text-2xl flex items-center gap-4 ml-5 font-bold'>
                        <p> {myDetails ? Number(myDetails?.data?.wallet + myDetails?.data?.third_party_wallet).toFixed(2) : "0.00"}</p>
                        <HiArrowPathRoundedSquare onClick={() => profileDetails(userId)} className=' text-xl' />
                    </p>
                </div>

                <div>
                    {currentAccount && (
                        <button disabled={currentAccount} onClick={connectWallet} className="bg-bg3 p-2  text-sm text-white w-full py-2 rounded-full outline-none font-semibold">{currentAccount ? "Connected" : "Connect"}</button>
                    )}
                    <p className='text-lg text-center pt-1 font-bold'>{balance}{tokenSymbol}</p>
                </div>
            </div>
          
            {/* Modals */}
            {(activeModal == 2) && (
                <div className="mt-5 ">
                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2'>
                        <h3 className="text-lg font-semibold text-bg2 flex items-center ">
                            <img className='w-6 h-6' src={save_wallet} alt="sd" /> &nbsp; <p className='text-white'>Deposit amount </p>
                        </h3>
                        <div className='grid grid-cols-3 mt-3 gap-3'>
                            {depositArray.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectAmountCamilino(item)}
                                    className={`col-span-1 border-[0.2px] border-lightGray flex items-center justify-center gap-3 rounded-md py-1  
                        ${selectedAmountCamilino == item ? 'bg-gradient-to-l from-customlightbtn to-customdarkBluebtn text-white' : 'text-lightGray'}`}>
                                    &nbsp;&nbsp;<p className={`${selectedAmountCamilino == item ? ' text-white' : 'text-customlightbtn'}`}>{i === 3 ? "1K" : i === 4 ? "5K" : i === 5 ? "10K" : i === 6 ? "20K" : i === 7 ? "50K" : i === 8 ? "100K" : item}</p>
                                </div>
                            ))}
                        </div>
                        {amountErrorCamilino && <p className="text-bg2 text-xs mt-2">{amountErrorCamilino}</p>}
                        <div className="flex items-center bg-red rounded-full text-sm mt-3 p-1">
                            <div className="w-8 flex items-center justify-center text-customlightbtn text-2xl font-bold"></div>
                            <input
                                value={upiAmountCamilino == 0 ? "" : upiAmountCamilino}
                                onChange={(e) => {
                                    const numericAmount = Number(e.target.value);
                                    setUpiAmountCamilino(numericAmount);
                                    validateAmount(numericAmount);
                                }}
                                type="text"
                                placeholder="Please enter the amount"
                                className="w-full p-1 bg-red border-none focus:outline-none text-white placeholder:text-xsm"
                            />

                            <button onClick={() => setUpiAmountCamilino("0")} className="flex items-center justify-center text-lightGray p-2 rounded-full">
                                <RxCrossCircled size={20} />
                            </button>
                        </div>
                        <button onClick={payin_deposit} className={`mt-4 w-full ${upiAmountCamilino >= paymenLimts?._minimum_deposit ? "text-white bg-gradient-to-r from-customlightbtn to-customdarkBluebtn" : "bg-gradient-to-l from-[#cfd1de] to-[#c7c9d9] text-gray"}   py-3 rounded-full border-none text-xsm `}>
                            Deposit
                        </button>
                    </div>

                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2 my-10'>
                        <div className='flex items-center gap-3 font-bold'>
                            <img className='w-8 h-8' src={rechargeIns} alt="dfd" />
                            <p className='text-white'>Recharge instructions</p>
                        </div>
                        <div className='' >
                            <ul className="px-2 py-4 my-2 border-redLight border-thin rounded-lg text-xsm text-lightGray">
                                <li className="flex items-start">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    If the transfer time is up, please fill out the deposit form again.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    The transfer amount must match the order you created, otherwise the money cannot be credited successfully.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    If you transfer the wrong amount, our company will not be responsible for the lost amount!.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    Note: Do not cancel the deposit order after the money has been transferred.
                                </li>

                            </ul>
                        </div>
                    </div>

                </div>
            )}
            {(activeModal == 1) && (
                <div className="mt-5 ">
                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2'>
                        <h3 className="text-lg font-semibold text-bg2 flex items-center ">
                            <img className='w-6 h-6' src={save_wallet} alt="sd" /> &nbsp; <p className='text-white'>Deposit amount </p>
                        </h3>
                        {/* <div className='grid grid-cols-3 mt-3 gap-3'>
                            {depositArray.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectAmount(item)}
                                    className={`col-span-1 border-[0.2px] border-lightGray flex items-center justify-center gap-3 rounded-md py-1  
                        ${selectedAmount == item ? 'bg-gradient-to-l from-customlightbtn to-customdarkBluebtn text-white' : 'text-lightGray'}`}>
                                    &nbsp;&nbsp;<p className={`${selectedAmount == item ? ' text-white' : 'text-customlightbtn'}`}>{i === 3 ? "1K" : i === 4 ? "5K" : i === 5 ? "10K" : i === 6 ? "20K" : i === 7 ? "50K" : i === 8 ? "100K" : item}</p>
                                </div>
                            ))}
                        </div> */}
                        {amountError && <p className="text-bg2 text-xs mt-2">{amountError}</p>}
                        <div className="flex items-center bg-red rounded-full text-sm mt-3 p-1">
                            <div className="w-8 flex items-center justify-center text-customlightbtn text-2xl font-bold"></div>
                            <input
                                value={upiAmount == 0 ? "" : upiAmount}
                                onChange={(e) => {
                                    const numericAmount = Number(e.target.value);
                                    setUpiAmount(numericAmount);
                                    validateAmount(numericAmount);
                                }}
                                type="number"
                                placeholder="Please enter the amount"
                                className="w-full p-1 bg-red border-none focus:outline-none text-white placeholder:text-xsm"
                            />

                            <button onClick={() => setUpiAmount("0")} className="flex items-center justify-center text-lightGray p-2 rounded-full">
                                <RxCrossCircled size={20} />
                            </button>
                        </div>
                        <button onClick={payin_deposit} className={`mt-4 w-full ${upiAmount >= paymenLimts?._minimum_deposit ? "text-white bg-gradient-to-r from-customlightbtn to-customdarkBluebtn" : "bg-gradient-to-l from-[#cfd1de] to-[#c7c9d9] text-gray"}   py-3 rounded-full border-none text-xsm `}>
                            Deposit
                        </button>
                    </div>

                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2 my-10'>
                        <div className='flex items-center gap-3 font-bold'>
                            <img className='w-8 h-8' src={rechargeIns} alt="dfd" />
                            <p className='text-white'>Recharge instructions</p>
                        </div>
                        <div className='' >
                            <ul className="px-2 py-4 my-2 border-redLight border-thin rounded-lg text-xsm text-lightGray">
                                <li className="flex items-start">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    If the transfer time is up, please fill out the deposit form again.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    The transfer amount must match the order you created, otherwise the money cannot be credited successfully.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    If you transfer the wrong amount, our company will not be responsible for the lost amount!.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightbtn font-bold mr-2">◆</span>
                                    Note: Do not cancel the deposit order after the money has been transferred.
                                </li>

                            </ul>
                        </div>
                    </div>

                </div>
            )}
            {activeModal == 0 && (
                <div className="mt-5 ">
                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2'>
                        <h3 className="text-lg font-semibold text-bg2 flex items-center ">
                            <img className='w-6 h-6' src={save_wallet} alt="sd" /> &nbsp; <p className='text-white'>Deposit amount </p>
                        </h3>
                        <div className='grid grid-cols-3 mt-3 gap-3'>
                            {USDTDepositArray.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleUSDTSelectAmount(item)}
                                    className={`col-span-1 border-[1px] flex items-center justify-center gap-3 rounded-md py-1 border-gray text-lightGray 
                        ${USDTselectedAmount == item ? 'bg-gradient-to-l from-customlightbtn to-customdarkBluebtn text-white' : ''}`}>
                                    $&nbsp;&nbsp;<p className={`${USDTselectedAmount == item ? ' text-white' : 'text-customlightbtn'}`}>{item}</p>
                                </div>
                            ))}
                        </div>

                        {amountErrorUSDT && <p className="text-bg2 text-xs mt-2">{amountErrorUSDT}</p>}
                        <div className=' rounded-md p-3 flex flex-col mt-3 items-center justify-center'>
                            <div className="flex items-center bg-red w-full rounded-full text-sm p-2">
                                <div className="w-8 flex items-center justify-center text-xl font-bold text-customlightbtn">$</div>
                                <div className="w-[1px] mx-2 flex items-center justify-center bg-lightGray h-5"></div>
                                <input
                                    value={usdtAmount == 0 ? "" : usdtAmount}
                                    onChange={(e) => {
                                        const numericAmount = Number(e.target.value);
                                        setUsdtAmount(numericAmount);
                                        validateAmount(numericAmount);
                                    }}
                                    type="number"
                                    placeholder="Please enter the amount"
                                    className="w-full p-1 bg-red border-none focus:outline-none text-white placeholder:text-lightGray text-xsm"
                                />
                            </div>
                            {/*  Input */}
                            <div className="flex items-center mt-3 bg-red w-full rounded-full text-sm p-2">
                                <div className="w-8 flex items-center justify-center text-xl font-bold text-customlightbtn"></div>
                                <div className="w-[1px] mx-2 bg-lightGray h-5"></div>
                                <input
                                    value={usdtAmount == 0 ? "" : usdtAmount * (paymenLimts?.deposit_conversion_rate || 1)}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setUsdtAmount(value / (paymenLimts?.deposit_conversion_rate || 1));
                                        validateAmount(value / (paymenLimts?.deposit_conversion_rate || 1));
                                    }}
                                    type="number"
                                    placeholder="Enter  amount"
                                    className="w-full p-1 bg-red border-none focus:outline-none text-white placeholder:text-lightGray text-xsm"
                                />
                            </div>
                        </div>
                        {/* <div className='bg-inputBg rounded-md p-3 flex flex-col mt-3 items-center justify-center'>
                            <div className="flex items-center bg-white w-full rounded-full text-sm p-2">
                                <div className="w-8 flex items-center justify-center text-xl font-bold text-bg2">$</div>
                                <div className="w-[1px] mx-2 flex items-center justify-center bg-lightGray h-5"></div>
                                <input
                                    value={usdtAmount == 0 ? "" : usdtAmount}
                                    onChange={(e) => {
                                        const numericAmount = Number(e.target.value);
                                        setUsdtAmount(numericAmount);
                                        validateAmount(numericAmount);
                                    }}

                                    type="number"
                                    placeholder="Please enter the amount"
                                    className="w-full p-1 bg-white border-none focus:outline-none text-redLight placeholder:text-lightGray text-xsm"
                                />
                                <button onClick={() => setUsdtAmount("0")} className="flex items-center justify-center text-lightGray p-2 rounded-full">
                                    <RxCrossCircled size={20} />
                                </button>
                            </div>
                            <div className="flex items-center bg-white w-full rounded-full text-sm mt-3 p-2">
                                <div className="w-8 flex items-center justify-center text-xl font-bold text-bg2"></div>
                                <div className="w-[1px] mx-2 flex items-center justify-center bg-lightGray h-5"></div>
                                <p
                                    className="w-full p-1 bg-white border-none focus:outline-none text-redLight placeholder:text-lightGray text-xsm"
                                >{usdtAmount * paymenLimts?.deposit_conversion_rate}</p>
                            </div>
                        </div> */}
                        <button onClick={payin_deposit} className={`mt-4 w-full ${usdtAmount >= paymenLimts?.USDT_minimum_deposit ? "text-white bg-gradient-to-r from-customlightbtn to-customdarkBluebtn" : "bg-gradient-to-l from-[#cfd1de] to-[#c7c9d9] text-gray"}   py-3 rounded-full border-none text-xsm `}>
                            Deposit
                        </button>
                    </div>
                    <div className='bg-customdarkBlue shadow-lg rounded-lg p-2 my-10'>
                        <div className='flex items-center gap-3 font-bold'>
                            <img className='w-8 h-8' src={rechargeIns} alt="dfd" />
                            <p className='text-white'>Recharge instructions</p>
                        </div>
                        <div className='' >
                            <ul className="px-2 py-4 my-2 border-redLight border-[1px] rounded-lg text-xsm text-lightGray">
                                <li className="flex items-start">
                                    <span className="text-customlightBlue font-bold mr-2">◆</span>
                                    If the transfer time is up, please fill out the deposit form again.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightBlue font-bold mr-2">◆</span>
                                    The transfer amount must match the order you created, otherwise the money cannot be credited successfully.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightBlue font-bold mr-2">◆</span>
                                    If you transfer the wrong amount, our company will not be responsible for the lost amount!.
                                </li>
                                <li className="flex items-start mt-2">
                                    <span className="text-customlightBlue font-bold mr-2">◆</span>
                                    Note: Do not cancel the deposit order after the money has been transferred.
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Deposit