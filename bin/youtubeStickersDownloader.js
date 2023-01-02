#!/usr/bin/env node
const axios = require("axios");
const Stream = require("stream").Transform,
  fs = require("fs");
const path = require("path");

const inputArgument = process.argv.reverse()[0];
if (inputArgument.startsWith("https://www.youtube.com/")) {
  var url = inputArgument;
} else {
  throw new Error(
    "The url provided should be in the format of [https://www.youtube.com/xxx]"
  );
}

try {
  var dir = path.join(
    fs.readFileSync(path.join(__dirname, ".youtubeStickersDownloader"), "utf8"),
    url.match(/https:\/\/www.youtube.com\/(.*)/)[1]
  );
} catch (e) {
  console.log('Please run "ytsd_init" to setup your target location first.');
}
const cookie =
  "GPS=1; YSC=hIAkWskbrFg; VISITOR_INFO1_LIVE=S4_yrffJJHU; PREF=tz=Asia.Hong_Kong&f6=40000000; SID=HwgQmTW9h5lrSjmwxLpMZHjrUc4JTCGXi3UaYefuTiHiqIeE_ZA6QWfRPYEoCG91q4ocAg.; __Secure-1PSID=HwgQmTW9h5lrSjmwxLpMZHjrUc4JTCGXi3UaYefuTiHiqIeETrH2PU8fXPaj5b9y8dOPNA.; __Secure-3PSID=HwgQmTW9h5lrSjmwxLpMZHjrUc4JTCGXi3UaYefuTiHiqIeEYRL5p_SwUC9yFNq3pNfvog.; HSID=Afc28GUdv_llxhIwG; SSID=ATHJNHBlA81zZQ9Kh; APISID=RVog7kPGY7P_S2oa/A3-BfkivISS7uwzaR; SAPISID=8KQo1ENe_CDOIF1U/Ar1lXpfGztYChTVG7; __Secure-1PAPISID=8KQo1ENe_CDOIF1U/Ar1lXpfGztYChTVG7; __Secure-3PAPISID=8KQo1ENe_CDOIF1U/Ar1lXpfGztYChTVG7; LOGIN_INFO=AFmmF2swRQIgEuAzRGfn6PzNmT3qYCMZMb77hW7LoGjP2zMo8kdHWSMCIQDOq1qtdpazeUOVlv_EFCKZon7xUDoOKQQuBhqc4yTa5A:QUQ3MjNmejJJRzBNd2FNODduTTF2U2lCcG92YzRzbEpLd2NrV0ZPdldzYUxsTHk3ekFKeHNzb2FyVVFlRm94ZWxMQmhHQmtRNm82Szl6SXFPX0hKd2dmV3NnMHhiQ09ya3dGdEpWTVZIZzVwZkk4X3MwV3FWQ1ZqSl8zUENndlExLU50VEh4RUNTSVVyQTNHQzdzZXRySHphZkx4NTJFRWNR; CONSISTENCY=AGDxDeNlRkZokYLNv_DSOpG_8-sUcdkfQ9WTdhSbvN3aUueS6Kw43pGeXslhzNfnzfyU5IkYEfTS2gSBk2qfwi5lZjYUQ409jksC0IWpr9DEZcZ06SAk19Cd-No; SIDCC=AJi4QfFi2XyD4Zu4_E2NtSWrLoqaUkWgCV94KPNGPusH7Kd0D4htBCjZ_iDitGI1dXmgB9jd6w; __Secure-3PSIDCC=AJi4QfEvDyEqqdFAF2sgRPow58_QA1-vtdIvkDjMKjuURHYVhFrRGm2anFnXj09JbNEpa4m-TA";

const options = {
  method: "GET",
  url,
  headers: {
    cookie: cookie,
    "x-origin": "https://www.youtube.com",
    authorization:
      "SAPISIDHASH 1646754080_a5e325c3e6632c169dba49afa74e79dac2d9b712",
  },
};

axios
  .request(options)
  .then((response) => {
    axios
      .request({
        ...options,
        method: "POST",
        url: "https://www.youtube.com/youtubei/v1/ypc/get_offers",
        ...{
          data: {
            context: {
              client: {
                clientName: "WEB",
                clientVersion: "2.20220307.01.00",
              },
            },
            itemParams: JSON.parse(
              response?.data?.split(`ypcGetOffersEndpoint":`)[1].split("},")[0]
            ).params,
          },
        },
      })
      .then((response) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        [0, 1]
          .reduce(
            (prev, curr) => [
              ...prev,
              ...response?.data?.actions[0]?.openPopupAction.popup?.sponsorshipsOfferRenderer?.tiers[0]?.sponsorshipsTierRenderer?.perks?.sponsorshipsPerksRenderer?.perks[
                curr
              ]?.sponsorshipsPerkRenderer?.images?.map(
                (el) => el.thumbnails[0].url
              ),
            ],
            []
          )
          .forEach((el, idx) => {
            axios
              .get(
                el.replace("https", "http").split("=")[0] + "=w512-h512-c-k-nd",
                {
                  responseType: "stream",
                }
              )
              .then(({ data: response }) => {
                const data = new Stream();
                response.on("data", function (chunk) {
                  data.push(chunk);
                });
                response.on("end", function () {
                  fs.writeFileSync(`${dir}/image${idx}.png`, data.read());
                });
              });
          });
      });
  })
  .catch(function (error) {
    console.error(error);
  });
