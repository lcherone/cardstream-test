const crypto = require("crypto");

/**
 * Cardstream helper
 */
module.exports = new function() {
  //
  const Cardstream = this;

  //
  Cardstream.signingKey = process.env.CARDSTREAM_SIGNINGKEY;
  Cardstream.merchantID = process.env.CARDSTREAM_MERCHANTID;
  Cardstream.endpoint = "https://gateway.cardstream.com/hosted/";

  /**
   * Generate a random uuid v4
   */
  Cardstream.transactionUnique = require("uuid/v4");

  /**
   * Sort and sign
   *
   * @link: https://github.com/cardstream/cardstream-sample-code/issues/2
   */
  Cardstream.sign = function(data) {
    if (!Cardstream.signingKey || !Cardstream.merchantID)
      throw Error("Cardstream credentials required");

    let str = "";
    let keys = Object.keys(data).sort();

    // for each key loop over in order
    for (let i in keys) {
      let key = keys[i];
      if (data.hasOwnProperty(key)) {
        let value = data[key].toString().replace(/(\r\n|\n\r|\n|\r|\t)/g, "\n");
        // save the value back into data
        data[key] = value;
        str += key + "=" + encodeURIComponent(value) + "&";
      }
    }

    str = str.slice(0, -1);

    // duplicate PHP's http_build_query()
    str = str
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A")
      .replace(/%20/g, "+");

    return {
      data: data,
      queryString: str,
      signature: crypto
        .createHash("SHA512")
        .update(str + Cardstream.signingKey)
        .digest("hex")
    };
  };

  /**
   * Verify signature
   *
   * @param {object} data
   * @returns Bool
   */
  Cardstream.verifySignature = function(data) {
    if (!data) throw Error("Invalid arguments");
    if (!data.signature) throw Error("Signature missing");

    let signature = data.signature;
    delete data.signature;

    data = Cardstream.sign(data);

    return data.signature === signature;
  };

  return Cardstream;
}();
