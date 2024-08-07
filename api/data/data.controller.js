const axios = require("axios");

// require("dotenv").config();

const URL = process.env.URL || process.env.NSE_URL;
const OPTION_URL = process.env.OPTION_URL;
const CHART_URL = process.env.CHART_URL;
const MASTER_QUOTE_URL = process.env.MASTER_QUOTE_URL;
const EQUITIES_URL = process.env.EQUITIES_URL;
const arrTypes = ["NIFTY", "BANKNIFTY", "FINNIFTY"];
const acceptHeader =
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
const cookie = process.env.COOKIE;
console.log("cookie ", cookie);

module.exports = {
  getData: (req, res, next) => {
    let selectedSymbol = req.query.symbol;

    let selectedType =
      req.query.type && arrTypes.includes(req.query.type)
        ? req.query.type
        : arrTypes[0];

    selectedType = !selectedSymbol ? selectedType : "";

    let fetchUrl = !!selectedSymbol
      ? EQUITIES_URL + selectedSymbol
      : OPTION_URL + selectedType;

    axios({
      method: "get",
      url: URL,
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: acceptHeader,
        cookie: cookie,
        Host: "www.nseindia.com",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        TE: "trailers",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
      },
    })
      .then((result) => {
        let cookie = result.headers["set-cookie"];

        return axios({
          method: "get",
          url: fetchUrl,
          headers: {
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: acceptHeader,
            cookie: cookie,
            Host: "www.nseindia.com",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            TE: "trailers",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
          },
        });
      })
      .then((result) => {
        let dataDecords = result.data;
        if (!dataDecords) {
          res.status(401).send({
            success: 0,
            data: result,
            message: "No data found!",
          });
        }
        let selectedDate =
          req.query.date &&
          dataDecords.records.expiryDates.includes(req.query.date)
            ? req.query.date
            : dataDecords.records.expiryDates[0];

        let filterData = dataDecords.records.data.filter(
          (a) => a.expiryDate == selectedDate
        );
        let excelData = [];
        let CE_totOI = 0;
        let CE_totVol = 0;
        let PE_totOI = 0;
        let PE_totVol = 0;
        filterData.forEach((element) => {
          let prepareElement = {
            Strike_Price: element.strikePrice,
            Expiry_Date: element.expiryDate,
            CALL_OI: element.CE ? element.CE.openInterest : 0,
            CALL_OI_CHANGE: element.CE ? element.CE.changeinOpenInterest : 0,
            CALL_VOL: element.CE ? element.CE.totalTradedVolume : 0,
            CALL_IV: element.CE ? element.CE.impliedVolatility : 0,
            CALL_LTP: element.CE ? element.CE.lastPrice : 0,
            PUT_OI: element.PE ? element.PE.openInterest : 0,
            PUT_OI_CHANGE: element.PE ? element.PE.changeinOpenInterest : 0,
            PUT_VOL: element.PE ? element.PE.totalTradedVolume : 0,
            PUT_IV: element.PE ? element.PE.impliedVolatility : 0,
            PUT_LTP: element.PE ? element.PE.lastPrice : 0,
          };

          CE_totOI = CE_totOI + prepareElement.CALL_OI;
          CE_totVol = CE_totVol + prepareElement.CALL_VOL;
          PE_totOI = PE_totOI + prepareElement.PUT_OI;
          PE_totVol = PE_totVol + prepareElement.PUT_VOL;

          excelData.push(prepareElement);
        });
        let order = req.query.order;
        if (order && "undefined" != order) {
          excelData.sort(GetSortOrder(order));
        }
        res.status(200).send({
          success: 1,
          data: excelData,
          expiryDates: dataDecords.records.expiryDates,
          selectedDate,
          selectedType,
          selectedSymbol,
          CE: { totOI: CE_totOI, totVol: CE_totVol },
          PE: { totOI: PE_totOI, totVol: PE_totVol },
          message: "Fetched data successfully!",
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          success: 0,
          data: err,
          message: "Failed to fetch data.",
        });
      });
  },
  getChartData: (req, res, next) => {
    axios({
      method: "get",
      url: URL,
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: acceptHeader,
        cookie: cookie,
      },
    })
      .then((result) => {
        let cookie = result.headers["set-cookie"];
        let index = req.query.index ? req.query.index : "";

        return axios({
          method: "get",
          url: CHART_URL + index,
          headers: {
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: acceptHeader,
            cookie: cookie,
          },
        });
      })
      .then((result) => {
        res.status(200).send({
          success: 1,
          data: result.data,
          message: "Fetched data successfully!",
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          success: 0,
          data: err,
          message: "Failed to fetch data.",
        });
      });
  },
  getMasterData: (req, res, next) => {
    axios({
      method: "get",
      url: URL,
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: acceptHeader,
        cookie: cookie,
      },
    })
      .then((result) => {
        let cookie = result.headers["set-cookie"];

        return axios({
          method: "get",
          url: MASTER_QUOTE_URL,
          headers: {
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: acceptHeader,
            cookie: cookie,
          },
        });
      })
      .then((result) => {
        res.status(200).send({
          success: 1,
          data: result.data,
          message: "Fetched data successfully!",
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          success: 0,
          data: err,
          message: "Failed to fetch data.",
        });
      });
  },
};

function GetSortOrder(prop) {
  return function (a, b) {
    if (a[prop] < b[prop]) {
      return 1;
    } else if (a[prop] > b[prop]) {
      return -1;
    }
    return 0;
  };
}
