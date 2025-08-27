import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import apis from "../../utils/apis";
import { useNavigate } from "react-router-dom";
import { FaRegCopy } from "react-icons/fa";
import no_data_available from "../../assets/images/no_data_available.png";
import Loader from "../../reusable_component/Loader/Loader";

function SubordinateData() {
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState(null);
  const [modalFirstValue, handleModalFirstValue] = useState(0);
  const [confirmedDate, setConfirmedDate] = useState("Select date");
  const [modalFirst, handleModalFirst] = useState(false);
  const [tier, setTier] = useState(null);
  const [suboridnateData, setSuborinateData] = useState(null);
  const modalRef = useRef(null);

  const [copyUid, setCopyUid] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  // const profileDetails = async () => {
  //   if (!userId) {
  //     toast.error("User not logged in");
  //     navigate("/login");
  //     return;
  //   }
  //   try {
  //     const res = await axios.get(`${apis?.profile}${userId}`);
  //     if (res?.data?.success === 200) {
  //       setMyDetails(res?.data)
  //     }
  //   } catch (err) {
  //     toast.error(err);
  //   }
  // };
  const tierHandler = async () => {
    setLoading(true);
    if (!userId) {
      toast.error("User not logged in");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get(`${apis.tier}`);
      // console.log("res1",res)
      if (res?.data?.status === 200) {
        setLoading(false);
        setTier(res?.data?.data);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };
  const subOrdinateDataHandler = async () => {
    setLoading(true);
    if (!userId) {
      toast.error("User not logged in");
      navigate("/login");
      return;
    }
    // const payload = {
    //   id: userId,
    //   tier: modalFirstValue,
    //   u_id: uid,
    //   // created_at: confirmedDate,
    // };
    // const payload1 = {
    //   id: userId,
    //   tier: 1,
    //   // u_id: uid,
    //   // created_at: confirmedDate,
    // };
    // console.log("payload", uid? payload:payload1);
    const urlWithoutUid=`${apis?.subordinateData}?id=${userId}&tier=${modalFirstValue}`
    const url=`${apis?.subordinateData}?id=${userId}&tier=${modalFirstValue}&u_id=${uid}`
    try {
      const res = await axios.get(uid ? url : urlWithoutUid);
      console.log("res1", res);
      if (res?.status === 200) {
        setLoading(false);
        setSuborinateData(res?.data);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
  };
  useEffect(() => {
    if (userId) {
      subOrdinateDataHandler();
    }
  }, [userId, modalFirstValue, confirmedDate]);

  useEffect(() => {
    tierHandler();
  }, []);

const handleCopyUID = (uid) => {
  console.log("UID to copy:", uid);

  const matchedUser = suboridnateData?.subordinates_data?.find(item => item.u_id === uid);

  if (matchedUser) {
    navigator.clipboard
      .writeText(uid)
      .then(() => {
        console.log("Filtered user data:", matchedUser); // ← This is the filtered user object
        setCopyUid(true);
        // You can do anything else with `matchedUser` here, like setting it to state
      })
      .catch(() => {
        toast.error("Failed to copy UID.");
      });
  } else {
    toast.error("UID not found in data.");
  }
};

  useEffect(() => {
    if (copyUid) {
      handleCopyUID();
      const timer = setTimeout(() => {
        setCopyUid(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copyUid, setCopyUid]);
  console.log("suboridnateData", suboridnateData);
  return (
    <div className="p-2 h-full w-full">
      {loading && <Loader setLoading={setLoading} loading={loading} />}
      <div className="w-full flex items-center justify-between bg-customdarkBlue rounded-md p-2">
        <input
          onChange={(e) => setUid(e.target.value)}
          placeholder="search subordinate UID "
          className=" text-[15px] text-white outline-none bg-customdarkBlue"
          type="text"
          name=""
          id=""
        />
        <div
          onClick={subOrdinateDataHandler}
          className="bg-red rounded-3xl px-5 py-0.5"
        >
          {" "}
          <IoSearchOutline className="text-white" size={30} />{" "}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button
          onClick={() => handleModalFirst(!modalFirst)}
          className="bg-customdarkBlue text-white rounded-md text-xsm  py-4 px-2 flex justify-between items-center shadow-md"
        >
          <p className="text-white">
            {modalFirstValue === 0
              ? "All"
              : modalFirstValue === 1
              ? "Level1"
              : modalFirstValue === 2
              ? "Level2"
              : modalFirstValue === 3
              ? "Level3"
              : modalFirstValue === 4
              ? "Level4"
              : modalFirstValue === 5
              ? "Level5"
              : modalFirstValue === 6
              ? "Level6"
              : modalFirstValue === 7
              ? "Level7"
              : modalFirstValue === 8
              ? "Level8"
              : modalFirstValue === 9
              ? "Level9"
              : modalFirstValue === 10
              ? "Level10"
              : ""}
          </p>
          <p>
            <IoIosArrowDown size={18} />
          </p>
        </button>
        {/* <button className="bg-customdarkBlue text-white rounded-md text-xsm  py-4 px-2 flex justify-center items-center shadow-md">
          <input
            value={confirmedDate}
            onChange={(e) => setConfirmedDate(e.target.value)}
            className="input-white-icon outline-none bg-customdarkBlue "
            type="date"
          />
        </button> */}
      </div>
      <div className="bg-customdarkBlue rounded-lg">
        <div className="grid grid-cols-2 w-full p-2  mt-3 text-xsm">
          <div className="col-span-1 flex flex-col items-center border-r-[1px] border-lightGray">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.number_of_deposit
                ? suboridnateData?.number_of_deposit
                : "0"}
            </p>
            <p className="text-white">Deposit number</p>
          </div>
          <div className="col-span-1 flex flex-col items-center">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.payin_amount
                ? Number(suboridnateData.payin_amount).toFixed(2)
                : "0"}
            </p>
            <p className="text-white">Deposit amount</p>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full p-2  mt-3 text-xsm">
          <div className="col-span-1 flex flex-col items-center border-r-[1px] border-lightGray">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.number_of_bettor
                ? Number(suboridnateData.number_of_bettor).toFixed(2)
                : "0"}
            </p>
            <p className="text-white">Number of bettors</p>
          </div>
          <div className="col-span-1 flex flex-col items-center">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.bet_amount
                ? Number(suboridnateData.bet_amount).toFixed(2)
                : "0"}
            </p>
            <p className="text-white">Total bet</p>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full p-2  mt-3 text-xsm">
          <div className="col-span-1 flex flex-col items-center border-r-[1px] border-lightGray">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.first_deposit
                ? Number(suboridnateData.first_deposit).toFixed(2)
                : "0"}
            </p>
            <p className="text-white text-center">
              Number of people making first deposit
            </p>
          </div>
          <div className="col-span-1 flex flex-col items-center">
            <p className="text-white text-sm font-bold">
              {suboridnateData?.first_deposit_amount
                ? Number(suboridnateData.first_deposit_amount).toFixed(2)
                : "0"}
            </p>
            <p className="text-white">First deposit amount</p>
          </div>
        </div>
      </div>

      <div className="mt-5 text-white">
        {suboridnateData?.subordinates_data?.length > 0 ? (
          suboridnateData?.subordinates_data?.map((item, i) => (
            <div
              key={i}
              className="bg-customdarkBlue rounded-lg py-2 px-2 mb-4"
            >
              <p className="py-4 border-b border1 ">
                UID: {item?.u_id}{" "}
                <button onClick={handleCopyUID}>
                  {" "}
                  <FaRegCopy />
                </button>
              </p>
              <div className="flex text-xsm items-center justify-between">
                <div>
                  <p className="py-1.5">Level</p>
                  <p className="py-1.5">Bet amount</p>
                  <p className="py-1.5">Deposit amount</p>
                  <p className="py-1.5">Commission</p>
                </div>
                <div>
                  <p className="py-1.5">{item?.level}</p>
                  <p className="py-1.5">{item?.bet_amount}</p>
                  <p className="py-1.5">{item?.total_cash}</p>
                  <p className="py-1.5">{item?.commission}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>
            <img src={no_data_available} className="mt-2" alt="ds" />
            <p className="text-white w-full text-center">No data</p>
          </div>
        )}
      </div>

      {/*  modal  */}
      {modalFirst && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="bg-customdarkBlue p-3 rounded-t-xl h-auto w-full xsm:w-[400px]"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleModalFirst(false)}
                className="text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModalFirst(false)}
                className="text-white"
              >
                Confirm
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  handleModalFirstValue(0);
                  // handleModalFirst(false);
                }}
                className={`border-t-[1px] border-border1 ${
                  modalFirstValue === 0 ? "text-white" : "text-customlightBlue"
                }`}
              >
                All
              </button>
              {tier?.length > 0 ? (
                tier?.map((item) => {
                  // console.log("item",item)
                  return (
                    <button
                      key={item?.id}
                      onClick={() => {
                        handleModalFirstValue(item?.id);
                      }}
                      className={`border-t-[1px] text-[12px] border-border1 py-0.5 ${
                        modalFirstValue === item?.id
                          ? "text-white"
                          : "text-customlightBlue"
                      }`}
                    >
                      {item?.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-white">No data found</p>
              )}
            </div>
          </div>
        </div>
      )}
      {copyUid && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="h-14 w-[300px] bg-black bg-opacity-70 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p>Copy successfull</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubordinateData;
