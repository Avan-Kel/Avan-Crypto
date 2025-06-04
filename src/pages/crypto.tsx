"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Chartpage from "@/components/chartpage";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineRocketLaunch } from "react-icons/md";
import { AiOutlineLineChart } from "react-icons/ai";
import { LuSettings2 } from "react-icons/lu";
import { FiShare2 } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

// union type for valid coin names
type Coin = "BTC" | "LTC" | "ADA" | "TRC";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TransactionHistoryItem {
  span1: string;
  span2: string;
  span3: string;
  span4: string;
  span5: string;
}

export default function CyptoHomePage() {
  const [onHistory, setOnHistory] = useState<TransactionHistoryItem[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<{
    BTC: number;
    LTC: number;
    ADA: number;
    TLC: number;
  }>({
    BTC: 0,
    LTC: 0,
    ADA: 0,
    TLC: 0,
  });

  // State to track if the dropdown is open or closed
  const [isOpen, setIsOpen] = useState(false);
  const [henOpen, setHenOpen] = useState(false);
  const [coin1Amount, setCoin1Amount] = useState<number | string>(""); // State for input amount of coin1
  const [coin2Amount, setCoin2Amount] = useState<number | string>(""); // State for input amount of coin2

  // Fixed conversion rates (example values, you can change them)
  const conversionRates: Record<string, number> = {
    BTC_LTC: 1024.81, // 1 BTC = 50 LTC
    BTC_ADA: 124921.92, // 1 BTC = 1000 ADA
    BTC_TRC: 84639.89, // 1 BTC = 10,000 TRC
    LTC_BTC: 0.00097, // 1 LTC = 0.02 BTC
    LTC_ADA: 121.69, // 1 LTC = 20 ADA
    LTC_TRC: 82.45, // 1 LTC = 200 TRC
    ADA_BTC: 0.000008, // 1 ADA = 0.001 BTC
    ADA_LTC: 0.0082, // 1 ADA = 0.05 LTC
    ADA_TRC: 0.68, // 1 ADA = 10 TRC
    TRC_BTC: 0.000012, // 1 TRC = 0.0001 BTC
    TRC_LTC: 0.012, // 1 TRC = 0.005 LTC
    TRC_ADA: 1.48, // 1 TRC = 0.1 ADA
  };

  // Initialize state for both coin selections (including the coin's name and image URL)
  const [coin1, setCoin1] = useState<{ name: Coin; img: string }>({
    name: "BTC",
    img: "/hd-orange-round-bitcoin-icon-removebg-preview.png",
  });
  const [coin2, setCoin2] = useState<{ name: Coin; img: string }>({
    name: "BTC",
    img: "/hd-orange-round-bitcoin-icon-removebg-preview.png",
  });

  // Define a map for coin images and names, where keys are of type 'Coin'
  const coinImages: Record<Coin, string> = {
    BTC: "/hd-orange-round-bitcoin-icon-removebg-preview.png",
    LTC: "/litelogoimages-removebg-preview.png",
    ADA: "/ada.png",
    TRC: "/tetherimages-removebg-preview.png", // Default image (Tether)
  };

  // Handle coin selection for the first dropdown
  const handleCoin1Select = (coin: Coin) => {
    setCoin1({ name: coin, img: coinImages[coin] }); // Update the selected coin with its image
    setIsOpen(false); // Close the dropdown
  };

  // Handle coin selection for the second dropdown
  const handleCoin2Select = (coin: Coin) => {
    setCoin2({ name: coin, img: coinImages[coin] }); // Update the selected coin with its image
    setHenOpen(false); // Close the second dropdown
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleHenDropdown = () => {
    setHenOpen(!henOpen);
  };

  // Convert coin1 to coin2 based on the fixed conversion rate
  const handleCoin1AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setCoin1Amount(amount);

    if (amount !== "") {
      // Calculate the conversion rate key dynamically
      const rateKey = `${coin1.name}_${coin2.name}`;
      const rate = conversionRates[rateKey];

      if (rate) {
        // Calculate coin2 amount based on the conversion rate
        const coin2Amount = parseFloat(amount) * rate;
        setCoin2Amount(coin2Amount.toFixed(6)); // Show up to 6 decimal places
      } else {
        setCoin2Amount("");
      }
    } else {
      setCoin2Amount("");
    }
  };

  // Convert coin2 to coin1 based on the fixed conversion rate (inverse conversion)
  const handleCoin2AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setCoin2Amount(amount);

    if (amount !== "") {
      // Calculate the conversion rate key dynamically for inverse conversion
      const rateKey = `${coin2.name}_${coin1.name}`;
      const rate = conversionRates[rateKey];

      if (rate) {
        // Calculate coin1 amount based on the inverse conversion rate
        const coin1Amount = parseFloat(amount) * rate;
        setCoin1Amount(coin1Amount.toFixed(6)); // Show up to 6 decimal places
      } else {
        setCoin1Amount("");
      }
    } else {
      setCoin1Amount("");
    }
  };

  // Fetch data from the CoinGecko API for live crypto prices
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_COINGECKO_BASE_URL}/simple/price?ids=bitcoin,litecoin,cardano,tether&vs_currencies=usd`
        );

        const data = await response.json();

        // Set the state with the fetched prices
        setCryptoPrices({
          BTC: data.bitcoin.usd,
          LTC: data.litecoin.usd,
          ADA: data.cardano.usd,
          TLC: data.tether.usd, // Assuming TLC is Tether
        });
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchCryptoPrices();
  }, []); // Run the effect only once on component mount

  // Fetch data from the API on mount
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        // Fetch transaction data from Supabase
        const { data, error } = await supabase
          .from("Transactionhistory") // Replace with your table name
          .select("date, profit, loss, fee, walletaddress");

        if (error) {
          throw new Error(error.message);
        }

        // Map the data to your desired format
        const fetchedHistory = data?.map(
          (transaction: {
            date: string;
            profit: string;
            loss: string;
            fee: string;
            walletaddress: string;
          }) => ({
            span1: transaction.date,
            span2: transaction.profit,
            span3: transaction.loss,
            span4: transaction.fee,
            span5: transaction.walletaddress,
          })
        );

        // Update state with fetched data
        setOnHistory(fetchedHistory || []);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    };

    fetchTransactionHistory();
  }, []);

  return (
    <div className="dark min-h-screen w-full overflow-x-hidden bg-black text-white">
      {/* First parent divider starts here */}
      <div className="flex sm:flex-nowrap cusm:flex-wrap">
        <div className="m-[5px] flex items-center mt-[1px] cusm:block lg:flex">
          <span>
            <Image
              src="/images.png"
              alt="BTC logo"
              width={30}
              height={30}
              className="rounded-full mt-[5px]"
            />
          </span>
          <span className="text-[15px] font-semibold mt-[10px] cusm:ml-[5px] md:ml-[0px] lg:ml-[5px] lg:mb-[7px] font-verdana">
            PromX
          </span>
        </div>

        <div className="m-[10px] border border-gray-500 rounded-[30px] sm:ml-[10px] lg:ml-[80px] xl:ml-[200px] cusm:ml-[5px] cusm:flex  bg-dark-gray w-[300px] p-[2px] ">
          <button className=" hover:bg-white hover:text-black rounded-[25px] p-[12px] text-[14px] font-medium font-verdana">
            Home
          </button>
          <button className=" hover:bg-white hover:text-black rounded-[25px] p-[12px] text-[14px] font-medium font-verdana">
            Trades
          </button>
          <button className=" hover:bg-white hover:text-black rounded-[25px] p-[12px] text-[14px] font-medium font-verdana">
            Wallet
          </button>
          <button className=" hover:bg-white hover:text-black rounded-[25px] p-[12px] text-[14px] font-medium font-verdana">
            Transactions
          </button>
        </div>

        <NavigationMenu className="sm:ml-[10px] xl:ml-[150px] lg:ml-[80px] cusm:ml-[60px]">
          <NavigationMenuList>
            <NavigationMenuItem>
              {/* <NavigationMenuTrigger> */}
              <Image
                src="/tetherimages-removebg-preview.png" // path relative to the public folder (without '/public')
                alt="bolt logo"
                width={30}
                height={30}
                className="rounded-[30px] font-[verdana]"
              />
              Tether
              {/* </NavigationMenuTrigger> */}
              <NavigationMenuContent></NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <button className="sm:m-[10px] sm:ml-[10px] xl:ml-[70px] lg:ml-[30px] md:ml-[20px] cusm:ml-[13px] cusm:h-[40px] cusm:p-[0px] cusm:text-[13px] bg-yellow-500 text-black rounded-[30px] font-semibold font-[verdana] text-[13px] p-[10px] cusm:mt-[15px] border border-white">
          Connect Wallet
        </button>

        <button className="m-[10px] sm:ml-[10px] xl:ml-[40px] lg:ml-[20px] md:p-[10px] lg:p-[10px] cusm:ml-[13px] h-[45px] w-[45px] rounded-[45px] bg-dark-gray pl-[11px]">
          <IoMdNotificationsOutline className="text-[22px]" />
        </button>

        <Button
          variant="outline"
          className="m-[10px] ml-[40px] sm:ml-[10px] md:ml-[15px] lg:ml-[25px] xl:ml-[40px] cusm:ml-[3px] h-[45px]"
        >
          Profile
        </Button>
      </div>
      {/* First parent divider ends here */}

      {/* Second parent divider starts here */}
      <div className="flex flex-wrap items-center w-full gap-x-4 gap-y-2 cusm:m-[10px] p-3">
        <button className="flex items-center gap-2 rounded-[10px]">
          <span className="text-[13px]">Trending Soon</span>
          <MdOutlineRocketLaunch />
        </button>

        <button className="flex items-center gap-2">
          <Image
            src="/hd-orange-round-bitcoin-icon-removebg-preview.png"
            alt="BTC logo"
            width={25}
            height={25}
          />
          <span className="text-[13px]">
            BTC ${cryptoPrices.BTC.toLocaleString()}
          </span>
        </button>

        <button className="flex items-center gap-2">
          <Image
            src="/litelogoimages-removebg-preview.png"
            alt="LTC logo"
            width={20}
            height={20}
            className="border rounded-[20px]"
          />
          <span className="text-[13px]">
            LTC ${cryptoPrices.LTC.toLocaleString()}
          </span>
        </button>

        <button className="flex items-center gap-2">
          <Image
            src="/ada.png"
            alt="ADA logo"
            width={20}
            height={20}
            className="border rounded-[20px]"
          />
          <span className="text-[13px]">
            ADA ${cryptoPrices.ADA.toLocaleString()}
          </span>
        </button>

        <button>
          <a href="#" className="underline text-[15px]">
            Discover more
          </a>
        </button>
      </div>

      {/* Second parent divider ends here */}

      {/* Third parent divider starts here */}
      <div className=" m-[10px] lg:flex md:flex ">
        {/* Third parent child 1 starts here */}
        <div className="xl:w-[25%] lg:w-[31.5%] md:w-[40%] cusm:w-full mt-[3px]">
          {/* T P Grand child 1 starts here */}
          <div className=" w-full ">
            <button className="bg-[rgb(17,17,17)] text-light-gray md:m-0.5 md:ml-[7px] md:p-0.5 md:h-[100px] md:w-[31%] cusm:ml-[7px] cusm:h-[120px] cusm:w-[30%] rounded-xl text-sm">
              <AiOutlineLineChart className="text-yellow-500 text-lg ml-9" />
              Market Stats
            </button>

            <button className="bg-[rgb(17,17,17)] text-light-gray md:m-0.5 md:p-0.5 md:h-[100px] md:w-[31%] cusm:ml-[10px] cusm:h-[120px] cusm:w-[30%] rounded-xl text-sm">
              <LuSettings2 className="text-yellow-500 text-lg ml-9" />
              Settings
            </button>

            <button className="bg-[rgb(17,17,17)] text-light-gray md:m-0.5 md:p-0.5 md:h-[100px] md:w-[31%] cusm:ml-[13px] cusm:h-[120px] cusm:w-[30%] rounded-xl text-sm">
              <FiShare2 className="text-yellow-500 text-lg ml-9" />
              Share
            </button>
          </div>

          {/* T P Grand child 1 ends here */}

          {/* T P Grand child 2 starts here */}
          <div className="bg-[rgb(17,17,17)] m-[3px] rounded-[20px] p-[17px] h-[568px] w-[307px] md:w-[97%] cusm:w-[98%]">
            <p>Swap cryptocurrency</p>
            <div className="flex items-center w-full bg-black rounded-[20px] mt-[20px] pl-[10px] p-[10px]">
              <span className="mr-[3px] text-[20px]">
                <CiSearch />
              </span>
              <input
                type="text"
                placeholder="Search token"
                className="rounded-lg bg-black text-light-gray w-full ml-0 text-sm"
              />
            </div>

            {/* Coin converter container starts here */}
            <div>
              <div className="bg-[rgb(17,17,17)] rounded-2xl p-1 mt-5">
                <p className="text-white mb-2">Coin Converter</p>

                {/* Input for the first coin in the pair */}
                <div>
                  <div className="bg-black p-[15px] rounded-t-[20px] flex mb-[5px]">
                    <input
                      type="number"
                      value={coin1Amount}
                      onChange={handleCoin1AmountChange}
                      placeholder="amount"
                      className="bg-black w-[80px]"
                    />

                    <div className="relative inline-block text-left md:ml-[20px] cusm:ml-[80px]">
                      {/* Dropdown Button */}
                      <button
                        onClick={toggleDropdown}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-dark rounded-md hover:bg-gray-800 hover:text-white"
                      >
                        <Image
                          src={coin1.img}
                          alt={coin1.name}
                          width="30"
                          height="30"
                          className="mr-2 rounded-full"
                        />
                        {coin1.name}
                        {isOpen ? (
                          <FaAngleUp size={20} className="ml-1" />
                        ) : (
                          <FaAngleDown size={20} className="ml-1" />
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {isOpen && (
                        <div className="absolute right-0 mt-2 w-[90%] z-10 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => handleCoin1Select("BTC")}
                              className="flex items-center ml-[7px] px-3 py-2 rounded-md text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.BTC}
                                alt="Bitcoin logo"
                                width="25"
                                height="25"
                                className="mr-2"
                              />
                              BTC
                            </button>
                            <button
                              onClick={() => handleCoin1Select("LTC")}
                              className="flex items-center ml-[7px] px-4 py-2 rounded-md  text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.LTC}
                                alt="Litecoin logo"
                                width="20"
                                height="20"
                                className="mr-2 rounded-full"
                              />
                              LTC
                            </button>
                            <button
                              onClick={() => handleCoin1Select("ADA")}
                              className="flex items-center ml-[7px] px-4 py-2 rounded-md text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.ADA}
                                alt="ADA logo"
                                width="20"
                                height="20"
                                className="mr-2 rounded-full"
                              />
                              ADA
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input for the second coin in the pair */}
                  <div className="bg-black p-[15px] rounded-b-[20px] flex">
                    <input
                      type="number"
                      value={coin2Amount}
                      onChange={handleCoin2AmountChange}
                      placeholder="amount"
                      className="bg-black w-[80px]"
                    />
                    <div className="relative inline-block text-left md:ml-[20px] cusm:ml-[80px]">
                      {/* Dropdown Button */}
                      <button
                        onClick={toggleHenDropdown}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white rounded-md hover:bg-gray-200"
                      >
                        <Image
                          src={coin2.img}
                          alt={coin2.name}
                          width="30"
                          height="30"
                          className="mr-2 rounded-full"
                        />
                        {coin2.name}
                        {henOpen ? (
                          <FaAngleUp size={20} className="ml-1" />
                        ) : (
                          <FaAngleDown size={20} className="ml-1" />
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {henOpen && (
                        <div className="absolute right-0 mt-2 w-[90%] origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => handleCoin2Select("BTC")}
                              className="flex items-center ml-[7px] px-3 py-2 rounded-md text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.BTC}
                                alt="Bitcoin logo"
                                width="25"
                                height="25"
                                className="mr-2"
                              />
                              BTC
                            </button>
                            <button
                              onClick={() => handleCoin2Select("LTC")}
                              className="flex items-center ml-[7px] px-4 py-2 rounded-md text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.LTC}
                                alt="Litecoin logo"
                                width="20"
                                height="20"
                                className="mr-2 rounded-full"
                              />
                              LTC
                            </button>
                            <button
                              onClick={() => handleCoin2Select("ADA")}
                              className="flex items-center ml-[7px] px-4 py-2 rounded-md text-sm text-white hover:bg-black"
                            >
                              <Image
                                src={coinImages.ADA}
                                alt="ADA logo"
                                width="20"
                                height="20"
                                className="mr-2 rounded-full"
                              />
                              ADA
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display the conversion result dynamically */}
              <span className="flex items-center">
                <p className="text-[12px] m-3 ml-[40px]">
                  {/* Dynamic conversion result */}
                  {coin1Amount && coin2Amount
                    ? `${coin1Amount} ${coin1.name} = ${coin2Amount} ${coin2.name}`
                    : "Enter amount to convert"}
                </p>
                <HiOutlineSwitchVertical />
              </span>
            </div>

            <h2 className="sm:mt-[0px] lg:mt-[0px]">Swap details</h2>

            <span className="flex items-center mt-[0px]">
              <p className="text-[13px] text-gray-500">Minimum recieved</p>{" "}
              <IoAlertCircleOutline className="text-gray-500 ml-1" />{" "}
              <span className="text-[13px] ml-[75px]">1,345 USDT</span>
            </span>

            <span className="flex items-center">
              <p className="text-[13px] text-gray-500">Gas fee</p>{" "}
              <IoAlertCircleOutline className="text-gray-500 ml-1" />
              <span className="text-[13px] ml-[60%]">$14.31</span>
            </span>

            <span className="flex items-center">
              <p className="text-[13px] text-gray-500">Price impact</p>{" "}
              <IoAlertCircleOutline className="text-gray-500 ml-1" />{" "}
              <p className="text-[13px] ml-[50%]">0.02%</p>
            </span>

            <button className="mt-4 h-9 bg-yellow-400 w-full text-black rounded-[20px] font-semibold font-verdana text-sm items-center border border-white">
              Swap
            </button>
          </div>

          {/* T P Grand child 2 ends here */}
        </div>
        {/* Third parent child 1 ends here */}

        {/* Third parent child 2 starts here */}
        <div className=" m-[2px] mt-[10px] w-full max-w-full overflow-hidden">
          <div className=" ">
            <Chartpage />
          </div>

          <div className="mt-[30px]">
            <h2 className="mb-[10px]">Transaction history</h2>

            <div className="custom-scrollbar h-[210px] overflow-auto">
              {onHistory.map((historian, index) => (
                <div
                  key={index}
                  className="mb-[7px] border rounded-[20px] border-gray-400 p-[10px]"
                >
                  <span className="text-yellow-500 mr-[30px] ml-[5px] text-[13px]">
                    {historian.span1}
                  </span>
                  <span>{historian.span2}</span>
                  <span className="text-[13px] text-gray-500 ml-[10px]">
                    {historian.span3}
                  </span>
                  <span className="ml-[50px] text-gray-500 text-[15px]">
                    {historian.span4}
                  </span>
                  <span className="ml-[50px] text-gray-500 text-[15px]">
                    {historian.span5}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Third parent child 2 ends here */}
      </div>
      {/* Third parent divider ends here */}

      {/* Fourth parent divider starts here */}
      <footer className="p-3 m-[10px] mt-[20px] border border-gray-500 rounded-[25px]">
        <div>
          <a href="" className="m-2 text-[15px] cusm:m-2">
            Affiliate
          </a>
          <a href="" className="m-2 text-[15px] cusm:m-[1%] sm:ml-[75px]">
            Regulations
          </a>
          <a href="" className="m-2 text-[15px] cusm:m-[2%] sm:ml-[75px]">
            Terms
          </a>
          <a href="" className="m-2 text-[15px] cusm:m-[1%] sm:ml-[75px]">
            FAQ
          </a>
          <a href="" className="m-2 text-[15px] cusm:m-[2%] sm:ml-[75px]">
            Docs
          </a>
          <a href="" className="m-2 text-[15px] cusm:m-[1%] sm:ml-[75px]">
            Contacts
          </a>
        </div>
      </footer>
      {/* Fourth parent divider ends here */}
    </div>
  );
}
