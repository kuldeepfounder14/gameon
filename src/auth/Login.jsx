import { MdKeyboardArrowDown, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apis from '../utils/apis';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../reusable_component/Loader/Loader';
import phoneUsa from "../assets/usaAsset/phone.png"
import metamask from "../assets/metamask.png"
import passwordUsa from "../assets/usaAsset/password.png"
import tikki from "../assets/usaAsset/tikki.png"
import cutomerService from "../assets/usaAsset/custoservice.png"
import email_tab from "../assets/usaAsset/email_tab.png"
import email_tab_color from "../assets/usaAsset/email_tab_color.png"
import phoneDesable from "../assets/usaAsset/phoneDesable.png"
import Connection from '../features/ethereum/Connection';
const loginEndpoint = apis?.login;

function Login() {
  const {
    currentAccount,
    connectWallet,
    balance,
    tokenSymbol,
    betAmount,
    setBetAmount,
    placeBet,
    isConnecting
  } = Connection();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()




  const MyProfileFn = async (userid) => {
    // const loginTokenFromLocalStorage = localStorage.getItem("login_token");
    try {
      const response = await axios.get(`${apis.profile}${userid}`);
      // console.log("login profile respones",response)
      // const profileToken = response?.data?.data?.login_token;
      if (response?.data?.success === 423) {
        // console.log("blocked")
        toast.error("Blocked by admin")
      } else {
        localStorage.setItem("userId", userid)
        setLoading(false)
        toast.success("Login successful!");
        navigate("/")
      }
    } catch (e) {
      // console.error(e);
      setLoading(false)
      toast.error("Blocked by admin")
    }
  };

  const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const handleLogin = async () => {
    // e.preventDefault();
    setLoading(true)
    const token = generateToken()
    try {
      const payload = { ethereum_account_id: currentAccount, login_token: token };
      // console.log("payload", payload)
      const response = await axios.post(`${apis?.login}`, payload);
      // console.log("resresrers", response)
      if (response?.data?.status === 200 || response?.data?.status === "200") {
        localStorage.setItem("login_token", token)
        await MyProfileFn(response?.data?.id)
      } else {

        toast.error(response?.data?.message);
        setLoading(false)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
      setLoading(false)
      console.log("Error:", err);
    }
  };


  useEffect(() => {
    if (currentAccount) {
      handleLogin();
    }
  }, [currentAccount]);

  return (
    <>
      {isConnecting && <Loader />}
      <section className="h-[100vh] font-inter w-full flex  flex-col items-start dark:text-white">
        <div className="bg-gradient-to-l from-red to-redLight w-full pb-5">
          <h1 className="text-sm font-bold font-inter px-10 mt-2">Log in</h1>
          <p className="text-[10px] px-10 mt-2">Please connect with MetaMask </p>
          {/* <p className="text-[10px] px-10">If you forget your password,please contact customer service </p> */}
        </div>
        <div className="flex flex-col w-full items-center justify-center px-5 lg:py-0">
          <div className=" w-full  text-white">
            <div>
              <div className="space-y-4 md:space-y-6 mt-3 " >
                <div className='flex flex-col font-bold items-center justify-center mt-10'>
                  <div className='pb-10'>
                    <img src={metamask} className='rounded-full w-14 h-14' alt="dsf" />
                  </div>
                  <button onClick={connectWallet}
                    type="submit"
                    disabled={!!currentAccount}
                    className="w-[90%] font-bold tracking-[0.20333rem] py-2.5 
    rounded-full border-none bg-gradient-to-b from-customlightbtn to-customdarkBluebtn shadow-lg 
    flex items-center justify-center"
                  >
                    {currentAccount ? "Connected" : "Connect"}
                  </button>

                </div>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center w-full text-white text-xsm mt-10'>
            <Link to="/customerservices" className='col-span-1 flex flex-col items-center justify-center'>
              <img className='w-11 h-10' src={cutomerService} alt="sd" />
              <p>Customer Service</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
