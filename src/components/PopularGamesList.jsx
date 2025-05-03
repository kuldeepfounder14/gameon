// import popuplarbg1 from '../assets/category/popuplarbg1.png';
// import aviator from '../assets/category/aviator.png';
// import plinkpo from '../assets/category/plinkpo.png';
// import limbo from '../assets/category/limbo.png';
// import aviator2 from '../assets/category/aviator2.png';
// import plinko from '../assets/category/plinko.png';
// import mines from '../assets/category/mines.png';
// import fortune from '../assets/category/fortune.png';
// import royalfishing from '../assets/category/royalfishing.png';
// import superrich from '../assets/category/superrich.png';
// import fortunerabbit from '../assets/category/fortunerabbit.png';
// import deco_first from "../assets/images/deco_first.png";
// import deco_second from "../assets/images/deco_second.png";
// import deco_third from "../assets/images/deco_third.png";
// import deco_four from "../assets/images/deco_four.png";
import { fetchAllGames, fetchGameURL } from "../reusable_component/gameApi";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import viewall from "../assets/usaAsset/homeScreen/viewall.png"
import lotterycategorywingo from "../assets/usaAsset/homeScreen/lotterycategorywingo.png"
import lotterycategorytrx from "../assets/usaAsset/homeScreen/lotterycategorytrx.png"
import alllotterybg from "../assets/usaAsset/homeScreen/alllotterybg.png"
import aviatornew from "../assets/usaAsset/homeScreen/aviatornew.png"
import k3 from "../assets/usaAsset/homeScreen/kk3.png"
import d5d from "../assets/usaAsset/homeScreen/d5d.png"
// import aviatornew from "../assets/usaAsset/homeScreen/aviatornew.png"
import dragontiger from "../assets/usaAsset/homeScreen/dragontiger.png"
import Plinko from "../assets/usaAsset/homeScreen/Plinko.png"
import andharBahar from "../assets/usaAsset/homeScreen/andharBahar.png"
import { useNavigate } from "react-router-dom";
import CasinoGamesList from "./CasinoGamesList";
import SlotsGamesList from "./SlotsGamesList";
import FishingGamesList from "./FishingGamesList";
import PokerGamesList from "./PokerGamesList";
import LobbyGamesList from "./LobbyGamesList";
import MiniGamesList from "./MiniGamesList";
function PopularGamesList() {
  const navigate = useNavigate()
  // const [loading, setLoading] = useState(false);
  // const userId = localStorage.getItem("userId")
  // console.log("userId", userId)
  const [allGamesListView, setAllGamesListView] = useState(null)
  useEffect(() => {
    fetchAllGames(setAllGamesListView);
  }, []);
  // console.log("allGamesListView", allGamesListView)


  const games = [
    { id: 1, name: "Win Go", bgimage: alllotterybg, image: lotterycategorywingo, route: "/lottery/wingo", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    { id: 2, name: "Trx Win Go", bgimage: alllotterybg, image: lotterycategorytrx, route: "/lottery/trxwingo", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    { id: 3, name: "K3 ", bgimage: alllotterybg, image: k3, route: "/lottery/k3", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    // { id: 4, name: "5D", bgimage: alllotterybg, image: d5d, route: "/comingsoon", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
  ];

  const hotgames = [
    { id: 1, name: "Andar Bahar ", bgimage: andharBahar, image: k3, route: "/andarbahar", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    { id: 2, name: "Dragon Tiger", bgimage: dragontiger, image: d5d, route: "/dragonTiger", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    { id: 3, name: "Avaitor", bgimage: aviatornew, image: lotterycategorywingo, route: "/aviator", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
    { id: 4, name: "Plinko", bgimage: Plinko, image: lotterycategorytrx, route: "/plinko", description1: "Guess Number", description2: "Green/Red/Violet to win", bgColor: "bg-gradient-to-l from-[#ff9a8e] to-[#f95959]" },
  ];
  // console.log("allGamesListView?.data?.casino?.length", allGamesListView)
  return (
    <>

      <div className="flex items-center justify-between gap-2 w-full  pr-2">
        <div className="flex items-center gap-2">

          <div className="h-7 w-2 bg-customlightbtn gap-2  rounded-[2px] flex items-center"> </div>
          <div className="text-[16px] font-extrabold">Lottery</div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center">
            <div
              onClick={() => navigate(`/allgames?activeModalValue=${0}`)}
              className="h-5 w-16 rounded-lg border-[0.5px] flex items-center justify-center text-[12px] p-2"> ALL
              <div className="text-[12px] text-customlightbtn pl-1 ">{games?.length}</div>
              <div className="text-[12px] text-lightGray "> <IoIosArrowForward />
              </div>
            </div>
          </div>
        </div>



      </div>
      <div className="grid grid-cols-2 w-full pr-2 gap-2 pt-2">
        {games.length > 0 ? (
          games.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              style={{
                backgroundImage: `url(${item?.bgimage})`,
                backgroundPosition: "center",
              }}
              className="flex flex-col items-center text-black p-2 h-[180px] w-full rounded-lg cursor-pointer"
            >
              <div className="text-[18px] font-serif font-bold text-white">
                {item.name}
              </div>
              <div className="h-16 w-16 pt-5">
                <img className="" src={item.image} alt="" />
              </div>
              <div className="pt-12 pl-20">
                <div className="h-5 w-16 rounded-xl border-[0.5px] flex items-center justify-center text-[16px] text-white font-serif font-extrabold p-2">
                  Go
                  <div className="text-[16px] text-white">
                    <IoIosArrowForward />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center text-white text-xl w-full col-span-3">
            No data
          </div>
        )}
      </div>

      {/* hotgames */}
      <div className="flex items-center justify-between gap-2 w-full  pr-2 mt-4">
        <div className="flex items-center gap-2">

          <div className="h-7 w-2 bg-customlightbtn gap-2  rounded-[2px] flex items-center"> </div>
          <div className="text-[16px] font-extrabold">Hot</div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="h-5 w-16 rounded-lg border-[0.5px] flex items-center justify-center text-[12px] p-2"> ALL
              <div className="text-[12px] text-customlightbtn pl-1 ">{hotgames?.length}</div>
              <div className="text-[12px] text-lightGray "> <IoIosArrowForward />
              </div>


            </div>
          </div>
        </div>



      </div>
      <div className="grid grid-cols-2 w-full pr-2 gap-2 pt-2">

        {/* <div className="col-span-2 flex"> */}
        {hotgames.length > 0 ? (
          hotgames.map((item,) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)} className=" flex flex-col items-center text-black p-2  h-[180px] w-full  rounded-lg" alt="sd">

              <img className="h-[180px] w-full  rounded-lg" src={item.bgimage} alt="" />


            </div>
          )))
          : (

            <div className="flex items-center justify-center text-black text-xl w-full col-span-3">No data</div>
          )}
        {/* </div>         */}
      </div>
      {/* <div className="grid grid-cols-2 w-full pr-2 gap-2 pt-2">
        <div className="col-span-1">
          <div
            onClick={() => navigate("/aviator")} className=" flex flex-col items-center text-black p-2  h-[180px] w-full  rounded-lg" alt="sd">

            <img className="h-[180px] w-full  rounded-lg" src={aviatornew} alt="" />


          </div>
        </div>
      </div> */}

      {/* casino games */}
      <div>{allGamesListView?.data?.casino?.length > 0 || allGamesListView?.data?.casino?.length === undefined ? <div></div> : <CasinoGamesList />}</div>
      <div>{allGamesListView?.data?.slots?.length > 0 || allGamesListView?.data?.slots?.length === undefined ? <div></div> : <SlotsGamesList />}</div>
      <div>{allGamesListView?.data?.poker?.length > 0 || allGamesListView?.data?.poker?.length === undefined ? <div></div> : <PokerGamesList />}</div>
      <div>{allGamesListView?.data?.fishing?.length > 0 || allGamesListView?.data?.fishing?.length === undefined ? <div></div> : <FishingGamesList />}</div>
      <div>{allGamesListView?.data?.lobby?.length > 0 || allGamesListView?.data?.lobby?.length === undefined ? <div></div> : <LobbyGamesList />}</div>
      <div>{allGamesListView?.data?.message?.data?.length > 0 || allGamesListView?.data?.message?.data?.length === undefined ? <div></div> : <MiniGamesList />}</div>

      {/* <SlotsGamesList/>
      <FishingGamesList/>
      <PokerGamesList/>
      <LobbyGamesList/>
      <MiniGamesList/> */}

      {/* <div className="w-full mt-2 font-bold flex items-center justify-center">
        <Link className="border-[1px] flex items-center justify-center w-full border-bg2 text- p-2 rounded-full gap-2" to={`/allgames?activeModalValue=${1}`}>
          <button className="flex items-center">
            <img className="w-7 h-7" src={viewall} alt="ds" />
            <p className="text-xsm">View </p>
          </button>
        </Link>
      </div> */}
    </>
  );
}

export default PopularGamesList;
