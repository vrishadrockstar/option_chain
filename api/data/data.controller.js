const URL = "https://www.nseindia.com";
const OPTION_URL = "https://www.nseindia.com/api/option-chain-indices?symbol=";
const axios = require("axios");
const arrTypes = ["NIFTY", "BANKNIFTY", "FINNIFTY"];
const acceptHeader = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9";
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36";

module.exports = {
  getData: (req, res, next) => {
    axios({
      method: "get",
      url: URL,
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        Accept:
          acceptHeader,
		"User-Agent":
		  userAgent,
        cookie:          "bm_sv=06AD295EF340D78218C8F1D93233D32C~vr1b3Bt2itochI0eCUSw0vOmU878XGWdh5Bl4AwSm7DNiFBOXdEWAcv1adoeJXYC1UGJGX1oFnwRxICOuaWOtstkswI4oPzqmV+XaQDPjrsB/B9Sy3u69q9j8PMTrBWAQatW7albJYOUBeqcBL1fvvRTZzWStvMAST15UIDaDZA=; Domain=.nseindia.com; Path=/; Max-Age=7175; HttpOnly",
      },
    })
      .then((result) => {
        let cookie = result.headers["set-cookie"];
        let selectedType =
          req.query.type && arrTypes.includes(req.query.type)
            ? req.query.type
            : arrTypes[0];

        return axios({
          method: "get",
          url: OPTION_URL + selectedType,
          headers: {
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            Accept:
              acceptHeader,
			"User-Agent":
			  userAgent,
            cookie: cookie,
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
          CE: { totOI: CE_totOI, totVol: CE_totVol },
          PE: { totOI: PE_totOI, totVol: PE_totVol },
          message: "Fetched data successfully!",
        });
      })
      .catch((err) => {
        console.log(err);
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
