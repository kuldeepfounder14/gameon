import { useEffect, useState } from 'react';
import HiloHeader from './HiloHeader';
import card1 from "../../assets/cards/1.png";
import card2 from "../../assets/cards/2.png";
import card3 from "../../assets/cards/3.png";
import card4 from "../../assets/cards/4.png";
import card5 from "../../assets/cards/5.png";
import card6 from "../../assets/cards/6.png";
import card7 from "../../assets/cards/7.png";
import card8 from "../../assets/cards/8.png";
import card9 from "../../assets/cards/9.png";
import card10 from "../../assets/cards/10.png";
import card11 from "../../assets/cards/11.png";
import card12 from "../../assets/cards/12.png";
import card13 from "../../assets/cards/13.png";
import card14 from "../../assets/cards/14.png";
import card15 from "../../assets/cards/15.png";
import card16 from "../../assets/cards/16.png";
import card17 from "../../assets/cards/17.png";
import card18 from "../../assets/cards/18.png";
import card19 from "../../assets/cards/19.png";
import card20 from "../../assets/cards/20.png";
import card21 from "../../assets/cards/21.png";
import card22 from "../../assets/cards/22.png";
import card23 from "../../assets/cards/23.png";
import card24 from "../../assets/cards/24.png";
import card25 from "../../assets/cards/25.png";
import card26 from "../../assets/cards/26.png";
import card27 from "../../assets/cards/27.png";
import card28 from "../../assets/cards/28.png";
import card29 from "../../assets/cards/29.png";
import card30 from "../../assets/cards/30.png";
import card31 from "../../assets/cards/31.png";
import card32 from "../../assets/cards/32.png";
import card33 from "../../assets/cards/33.png";
import card34 from "../../assets/cards/34.png";
import card35 from "../../assets/cards/35.png";
import card36 from "../../assets/cards/36.png";
import card37 from "../../assets/cards/37.png";
import card38 from "../../assets/cards/38.png";
import card39 from "../../assets/cards/39.png";
import card40 from "../../assets/cards/40.png";
import card41 from "../../assets/cards/41.png";
import card42 from "../../assets/cards/42.png";
import card43 from "../../assets/cards/43.png";
import card44 from "../../assets/cards/44.png";
import card45 from "../../assets/cards/45.png";
import card46 from "../../assets/cards/46.png";
import card47 from "../../assets/cards/47.png";
import card48 from "../../assets/cards/48.png";
import card49 from "../../assets/cards/49.png";
import card50 from "../../assets/cards/50.png";
import card51 from "../../assets/cards/51.png";
import card52 from "../../assets/cards/52.png";
import cards3 from "../../assets/Hilo/cards3.png";
import backCard from "../../assets/Hilo/cardback.png";
import { IoIosRefresh } from "react-icons/io";
import './HiloSlide.css';
import { MdKeyboardDoubleArrowUp, MdOutlineImageSearch, MdOutlineKeyboardDoubleArrowDown } from 'react-icons/md';
import HiloFooter from './HiloFooter';
import { useNavigate } from 'react-router-dom';
import ResultModal from './ResultModal';
import axios from 'axios';
import apis from '../../utils/apis';
import { toast } from 'react-toastify';
import HiLoSocket from './HiLoSocket';
const allCards = [
    card1, card2, card3, card4, card5, card6, card7, card8, card9, card10,
    card11, card12, card13, card14, card15, card16, card17, card18, card19, card20,
    card21, card22, card23, card24, card25, card26, card27, card28, card29, card30,
    card31, card32, card33, card34, card35, card36, card37, card38, card39, card40,
    card41, card42, card43, card44, card45, card46, card47, card48, card49, card50,
    card51, card52
];

function HiLoHome() {
    const userId = localStorage.getItem("userId");
    const [betAmount, setBetAmount] = useState(10);
    const [profileRefresher, setProfileRefresher] = useState(false)
    const cardHistory = [card1, card4, card6, card3, card12, card18, card1, card5, card17, card18, card19, card14, card12, card18, card19, card16, card12];
    const [startAnimation, setStartAnimation] = useState(false);
    const [showFrontCard, setShowFrontCard] = useState(false);
    const [randomCard, setRandomCard] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isResultModal, setIsResultModal] = useState(false);
    const [gameResultHistory, setGameResultHistory] = useState([]);
    const [gameResultDataAnnouncemnt, setGameResultDataAnnouncemnt] = useState([]);
    const [gameResultData, setGameResultData] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        const handleSocket = (hotair) => {
            const q = JSON.parse(hotair);
            setTimeLeft(q?.timerBetTime);
        };
        HiLoSocket.on("admin_hilo", handleSocket);
        return () => HiLoSocket.off("admin_hilo", handleSocket);
    }, []);
    const handleTapCard3 = () => {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        const selectedCard = allCards[randomIndex];

        setRandomCard(selectedCard);
        setStartAnimation(true);
        setShowFrontCard(false);

        setTimeout(() => {
            setShowFrontCard(true);

        }, 400);

        setTimeout(() => {
            //  setStartAnimation(false);
        }, 1500);
    };

    useEffect(() => {
        gameResult()
        gameBetHistory()
    }, [])
    useEffect(() => {
        const betStatus = localStorage.getItem("hilo_bet")
        if (timeLeft === 11) {
            gameResult()
        }
        if (timeLeft === 10) {
            const diceNumber = gameResultData?.length > 0 && Number(gameResultData[0]?.number)
            // shuffleDice(diceNumber);
        }
        if (timeLeft === 4) {
            if (betStatus === "true") {
                gameResultAnnouncement()
                localStorage.setItem("hilo_bet", "false")
            }
        }
        if (timeLeft === 2) {
            gameBetHistory()
        }
        if (timeLeft === 1) {
            setIsResultModal(false)
            // setCurrentDice(0);
            // handleClear()
        }
    }, [timeLeft]);

    const placeBetHandler = async () => {
        if (!userId) {
            toast.error("User not logged in");
            navigate("/login");
            return;
        }
        const bets = [];
        // numberAmounts.forEach((amount, index) => {
        //     if (amount > 0) bets.push({ number: Number(index + 1), amount });
        // });

        const payload = {
            userid: userId,
            game_id: 24,
            json: bets
        }
        // console.log("object", payload)
        try {
            const response = await axios.post(apis?.dragon_bet, payload)
            // console.log("bet resoinse", response)
            if (response?.data?.status === 200) {
                setProfileRefresher(true)
                localStorage.setItem("hilo_bet", "true");
                toast.success(response?.data?.message)
            } else {
                toast.error("Bet failed!");
            }
        } catch (err) {
            console.log("error hisotry", err);
            if (err?.response?.data?.status === 500) {
                console.log("error hisotry", err);
            } else {
                toast.error(err?.response?.data?.message)
            }
        }
    }

    // period number and last some results
    const gameResult = async () => {
        try {
            const res = await axios.get(
                `${apis?.dice_Results}?game_id=24&limit=15`
            );
            console.log("game res", res)
            if (res?.data?.status === 200) {
                setGameResultData(res?.data?.data)
            }
        } catch (err) {
            if (err?.response?.data?.status === 500) {
                console.log("error hisotry", err);
            } else {
                toast.error(err?.response?.data?.message)
            }
        }
    };

    const gameResultAnnouncement = async () => {
        if (!userId) {
            toast.error("User not logged in");
            navigate("/login");
            return;
        }
        console.log("userId", typeof Number(userId))
        const sr = gameResultData?.length > 0 && (Number(gameResultData[0]?.games_no) + 1)
        try {
            const response = await axios.get(`${apis?.dice_win_amount}/`, {
                params: {
                    userid: Number(userId),
                    game_id: 24,
                    games_no: sr
                }
            });
            console.log("gameresult responsere", response)
            if (response?.data?.status === 200) {
                setGameResultDataAnnouncemnt(response?.data)
                setIsResultModal(true)
            }
        } catch (err) {
            console.log("server erro ", err)
            if (err?.response?.data?.status === 500) {
                console.log("server erro ", err)
            } else {
                toast.error(err?.response?.data?.message)
            }
        }
    }

    const gameBetHistory = async () => {
        const payload = {
            userid: userId,
            game_id: 24,
            limit: 10,
            offset: 0
        }
        try {
            const res = await axios.post(
                `${apis?.dice_Bet_history}`, payload
            );
            // console.log("hisotry", res)
            if (res?.data?.status === 200) {
                setGameResultHistory(res?.data?.data)
            }
        } catch (err) {
            if (err?.response?.data?.status === 500) {
                console.log("error hisotry", err);
            } else {
                toast.error(err?.response?.data?.message)
            }
        }
    };
    return (
        <div
            className="h-full w-full overflow-y-scroll justify-between flex flex-col items-center hide-scrollbar"
            style={{
                background: "linear-gradient(to right, orange, #FFBF00, #FFBF00, orange)"
            }}
        >
            <div className="w-full">
                <HiloHeader profileRefresher={profileRefresher} gameResultHistory={gameResultHistory} setProfileRefresher={setProfileRefresher} />

                {/* Serial + Timer */}
                <div className="flex justify-between m-4">
                    <div className="h-8 w-24 bg-[#a77b2a] opacity-90 rounded-lg text-center text-[10px] font-roboto"
                        style={{ textShadow: "1px 1px 3px black" }}>
                        S.no:- 1234567890987
                    </div>
                    <div className="h-8 w-24 bg-[#a77b2a] opacity-90 rounded-lg text-center text-[20px] font-bold font-mono"
                        style={{ textShadow: "1px 1px 3px black" }}>
                        {timeLeft}
                    </div>
                </div>

                {/* Card History */}
                <div className="flex overflow-x-auto hide-scrollbar space-x-2 items-center h-12 bg-[#a77b2a] opacity-90 rounded-lg text-center text-[20px] font-bold font-mono m-2 p-2"
                    style={{ textShadow: "1px 1px 3px black" }}>
                    {cardHistory.map((imgSrc, index) => (
                        <img key={index} src={imgSrc} alt={`Card ${index}`} className="w-6 h-8 shadow-md" />
                    ))}
                </div>

                {/* Main Cards */}
                <div className='flex items-center justify-center gap-6 mt-5 relative' style={{ height: "200px" }}>
                    {/* Static Card */}
                    <div
                        className='h-40 w-36 rounded-md relative z-10'
                    >
                        <img src={cards3} alt='cards3' className="h-full w-full object-contain" />
                        {/* Overlay animation: slides in + flips */}
                        {startAnimation && (
                            <div className={`absolute -top-6 left-0 h-52 w-36 z-10 card-overlay ${showFrontCard ? 'flip' : ''}`}>
                                <div className="flipper">
                                    <img src={backCard} alt='Back Card' className="front h-full w-full object-cover" />
                                    <img src={randomCard ?? card10} alt='Revealed Card' className="back h-full w-full object-cover" />
                                </div>
                            </div>
                        )}
                        {/* Keep showing the last revealed card */}
                        {!startAnimation && randomCard && (
                            <div className="absolute -top-6 left-0 h-52 w-36 z-10">
                                <img src={randomCard} alt='Revealed Card' className="h-full w-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Right card (placeholder only, non-functional) */}
                    <div className='h-52 w-52 rounded-md'>
                        <img src={backCard} alt='Right Back Card' className="h-full w-full object-contain opacity-70" />
                    </div>
                </div>
                <div className='flex items-center justify-center mt-8'
                    onClick={handleTapCard3}
                >
                    <div className='h-10 w-36 rounded-lg border border-white flex items-center justify-center gap-6 '>
                        <div className='text-2xl text-white'>
                            <IoIosRefresh />

                        </div>
                        <div className='text-2xl text-white'>
                            <MdOutlineImageSearch />
                        </div>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    <div className='flex items-center justify-between'>
                        <button
                            className="relative bg-gradient-to-tr from-[#0052CC] to-[#3399FF] text-white shadow-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] h-11 w-40 font-serif font-bold text-[12px] m-2 rounded-lg flex items-center justify-center">
                            <div className='text-[25px]'> <MdOutlineKeyboardDoubleArrowDown /></div>
                            LOW OR SAME
                        </button>
                    </div >
                    <div className='flex items-center justify-between'>
                        <button
                            className="relative bg-gradient-to-tr from-[#B30000] to-[#FF4D4D] text-white shadow-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] h-11 w-40 font-serif font-bold text-[12px] m-2 rounded-lg flex items-center justify-center">
                            <div className='text-[25px]'> <MdKeyboardDoubleArrowUp />
                            </div>
                            HIGH OR SAME
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full">
                <HiloFooter betAmount={betAmount} setBetAmount={setBetAmount} onPlaceBet={placeBetHandler} timeLeft={timeLeft} />
            </div>
            {isResultModal && (
                <ResultModal onClose={() => setIsResultModal(false)} announcementData={gameResultDataAnnouncemnt} />
            )}
        </div>
    );
}

export default HiLoHome;
