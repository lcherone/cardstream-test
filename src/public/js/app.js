/*global globals, $, _ */

_.deepClone = function(val) {
  return JSON.parse(JSON.stringify(val));
};

const ajax = (function() {
  var request = function(action, method, data) {
    if (
      data &&
      (method === "PUT" || method === "POST" || method === "DELETE")
    ) {
      data = JSON.stringify(data);
    }

    return $.ajax({
      url: action,
      method: method,
      type: method,
      data: data,
      dataType: "json",
      cache: false,
      contentType: "application/json; charset=UTF-8"
    });
  };

  return {
    get: function(action, data) {
      return request(action, "GET", data);
    },
    post: function(action, data) {
      return request(action, "POST", data);
    },
    put: function(action, data) {
      return request(action, "PUT", data);
    },
    delete: function(action, data) {
      return request(action, "DELETE", data);
    }
  };
})();

//
new Vue({
  el: "#app",
  data() {
    return {
      state: {
        page: "index",
        processing: false,
        transaction: {},
        cards: [],
        selected_card: "",
        payment: {}
      },
      inventory: [
        {
          name: "Test purchase",
          description: "A test item to buy.",
          amount: 10.01
        }
      ],
      form: {
        errors: {},
        values: {
          user_id: 0,
          firstName: "",
          lastName: "",
          email: "",
          address_1: "",
          address_2: "",
          town: "",
          country: "United Kingdom",
          county: "",
          postcode: "",
          tos_agree: false,
          basket: [],
          card: {}
        }
      },
      // test data
      users: [
        {
          id: 1234,
          firstName: "Joe",
          lastName: "Blogs",
          email: "joe-blogs@example.com",
          address: {
            address_1: "Flat 6, Primrose Rise",
            address_2: "347 Lavender Road",
            town: "Northampton",
            county: "",
            country: "United Kingdom",
            postcode: "NN17 8YG"
          },
          cards: [
            {
              type: "Visa",
              number: "4929421234600821",
              cvv: "356",
              expiry: [12, 2019],
              address: {
                address_1: "Flat 6, Primrose Rise",
                address_2: "347 Lavender Road",
                town: "Northampton",
                county: "",
                country: "United Kingdom",
                postcode: "NN17 8YG"
              }
            }
          ]
        }
      ],
      signature_test: {},
      example_response: {
        merchantID: "100856",
        threeDSEnabled: "Y",
        avscv2CheckEnabled: "Y",
        riskCheckEnabled: "N",
        caEnabled: "N",
        rtsEnabled: "N",
        cftEnabled: "N",
        resellerGatewayUrl: "https://gateway.cardstream.com/hosted/",
        eReceiptsEnabled: "N",
        surchargeEnabled: "N",
        transactionID: "36943501",
        merchantAlias: "100856",
        xref: "19042803WH25PT42SH69VRP",
        state: "captured",
        redirectURL: "https://x9p7k7z5v4.sse.codesandbox.io/pay/verify",
        callbackURL: "https://x9p7k7z5v4.sse.codesandbox.io/pay/webhook",
        remoteAddress: "185.232.21.29",
        action: "SALE",
        type: "1",
        currencyCode: "826",
        countryCode: "826",
        amount: "1001",
        currencyExponent: "2",
        orderRef: "1 item [Test purchase]",
        transactionUnique: "a3f25bad-8198-4ea7-9137-61f84aadda4e",
        paymentMethod: "card",
        cardTypeCode: "VC",
        cardNumberMask: "492942******0821",
        cardExpiryDate: "1219",
        cardExpiryMonth: "12",
        cardExpiryYear: "19",
        customerMerchantRef: "1234",
        customerName: "Joe Blogs",
        customerAddress:
          "Flat 6, Primrose Rise\r\n347 Lavender Road\r\nNorthampton",
        customerPostcode: "NN17 8YG",
        customerEmail: "joe-blogs@example.com",
        merchantWebsite: "https://cardstream.com",
        eReceiptsStoreID: "1",
        customerReceiptsRequired: "N",
        cv2CheckPref: "matched",
        addressCheckPref: "matched",
        postcodeCheckPref: "matched",
        threeDSCheckPref: "authenticated",
        threeDSXID: "MDAwMDAwMDAwMDAwMzY5NDM1MDE=",
        threeDSEnrolled: "Y",
        threeDSACSURL: "https://acs.3ds-pit.com/",
        threeDSPaReq:
          "eJxVUttuwjAM/ZWKD2gutIgiE6nQaeOhCG28TNMestQbldYLSbqxff0S2sKIFMnH\r\nzvHlOLA/aMTsCVWnUUCOxsgPDMpiOYmViuk7n71FSRFNBOzSRzwK+EJtyqYWLKQh\r\nBzJCR9XqIGsrQKrjarMVjE+jeAZkgFCh3mSCupMkjthDqGWFYi11YaxGWQV7NBbI\r\n2Quq6Wqrf8ScuzQjgE5/ioO1rVkQoi7EUDUVEB8Dcm1l13nLuFynshB5ln7f3N/n\r\neJvlLM/ulkD8CyikRcEpS2jE5wHlCx4voimQsx9k5ZsQ96tdwGhImRuu90DrC6U9\r\nYNRH/nvAqauxVuMoIwI8tU2N7oUT5GJDgUYJFpQWq+DFCxK0wxyvrhMfBHKdbP3g\r\nJVfWqRklPIm4F35G6Zz7/vqAL1Q68VjC+koeAPFUMuyVDLt31s2f+APHN7NN",
        threeDSPaRes:
          "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",
        threeDSResponseCode: "0",
        threeDSResponseMessage: "Success",
        threeDSVETimestamp: "2019-04-28 03:25:42",
        threeDSCheck: "authenticated",
        responseCode: "0",
        responseMessage: "AUTHCODE:385359",
        riskCheckPref:
          "not known=continue,not checked=continue,approve=continue,decline=decline1,review=authonly,escalate=authonly",
        requestMerchantID: "100856",
        processMerchantID: "100856",
        cardType: "Visa Credit",
        cardScheme: "Visa ",
        cardSchemeCode: "VC",
        cardIssuer: "BARCLAYS BANK PLC",
        cardIssuerCountry: "United Kingdom",
        cardIssuerCountryCode: "GBR",
        cardFlags: "8323072",
        cardNumberValid: "Y",
        vcsResponseCode: "0",
        vcsResponseMessage: "Success - no velocity check rules applied",
        cardCVVMandatory: "Y",
        requestID: "5cc50f260c493",
        threeDSAuthenticated: "Y",
        threeDSECI: "05",
        threeDSCAVV: "M0RTUElULUFDQ0VTU0NPTlRST0w=",
        threeDSCAVVAlgorithm: "2",
        authorisationCode: "385359",
        responseStatus: "0",
        timestamp: "2019-04-28 03:25:51",
        amountApproved: "1001",
        amountReceived: "1001",
        amountRetained: "1001",
        avscv2ResponseCode: "222100",
        avscv2ResponseMessage: "ALL MATCH",
        avscv2AuthEntity: "merchant host",
        cv2Check: "matched",
        addressCheck: "matched",
        postcodeCheck: "matched",
        threeDSCATimestamp: "2019-04-28 03:25:51",
        formAmountEditable: "N",
        customerNameMandatory: "Y",
        cardExpiryDateMandatory: "Y",
        displayCurrency: "GBP",
        displayAmount: "GBP 10.01",
        merchantName: "Cardstream Test",
        merchantID2: "100856",
        signature:
          "700dd02ca9bd2832774746f2ba3778e01f876775b258ba364ad7844f50e8fd8c70b191149721af3311b17ccac086ccacf46a85523ab589231e1ef436197be909"
      }
    };
  },
  watch: {
    "state.selected_card": function(newValue) {
      this.setCard(this.state.cards[newValue]);
    }
  },
  computed: {
    total_basket_amount: function() {
      var total = 0;
      for (var i in this.form.values.basket) {
        total = total + this.form.values.basket[i].amount;
      }
      return total;
    }
  },
  created() {
    if (globals.payment.merchantID) {
      this.state.payment = globals.payment;
      this.state.page = "payment";
    }
  },
  mounted() {
    $('[data-toggle="tooltip"]').tooltip();
  },
  methods: {
    addToCart(item) {
      this.form.values.basket.push(item);
    },
    removeItem(index) {
      this.form.values.basket.splice(index, 1);
    },
    // test methods
    setUser(item) {
      this.form.values.user_id = item.id;
      this.form.values.firstName = item.firstName;
      this.form.values.lastName = item.lastName;
      this.form.values.email = item.email;
      this.form.values.address_1 = item.address.address_1;
      this.form.values.address_2 = item.address.address_2;
      this.form.values.town = item.address.town;
      this.form.values.county = item.address.county;
      this.form.values.country = item.address.country;
      this.form.values.postcode = item.address.postcode;
      this.state.cards = item.cards;
    },
    setCard(item) {
      this.$set(this.form.values, "card", {
        number: item.number,
        cvv: item.cvv,
        expiry: item.expiry
      });
      this.form.values.address_1 = item.address.address_1;
      this.form.values.address_2 = item.address.address_2;
      this.form.values.town = item.address.town;
      this.form.values.county = item.address.county;
      this.form.values.country = item.address.country;
      this.form.values.postcode = item.address.postcode;
    },
    isValidEmail(str) {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(str).toLowerCase());
    },
    submit() {
      this.state.processing = true;

      var errors = {};

      //
      if (!this.form.values.firstName) {
        errors.firstName = "required field";
      }

      if (!this.form.values.lastName) {
        errors.lastName = "required field";
      }

      if (!this.form.values.email) {
        errors.email = "required field";
      } else if (!this.isValidEmail(this.form.values.email)) {
        errors.email = "invalid email";
      }

      //
      if (!this.form.values.address_1) {
        errors.address_1 = "required field";
      }

      if (!this.form.values.town) {
        errors.town = "required field";
      }

      if (!this.form.values.county) {
        //errors.county = "required field";
      }

      if (!this.form.values.country) {
        errors.country = "required field";
      }

      if (!this.form.values.postcode) {
        errors.postcode = "required field";
      }

      //
      if (!this.form.values.tos_agree) {
        errors.tos_agree = "you must accept our terms of service";
      }

      if (!_.isEmpty(errors)) {
        this.form.errors = errors;
        this.state.processing = false;
        return;
      }

      //
      ajax
        .post("/pay", this.form.values)
        .done(
          function(data) {
            if (!_.isEmpty(data.errors)) {
              this.form.errors = data.errors;
            }

            // create hidden form
            var form = document.createElement("form");
            form.setAttribute("method", "post");
            form.setAttribute(
              "action",
              "https://gateway.cardstream.com/hosted/"
            );
            for (var i in data.transaction) {
              if (!data.transaction.hasOwnProperty(i)) continue;
              var input = document.createElement("input");
              input.setAttribute("type", "hidden");
              input.setAttribute("name", i);
              input.setAttribute("value", data.transaction[i]);
              form.appendChild(input);
            }
            document.getElementsByTagName("body")[0].appendChild(form);
            form.submit();
            form.reset();

            this.state.processing = false;
          }.bind(this)
        )
        .fail(
          function(err) {
            this.state.errors.global =
              "Failed to obtain transaction. Please refresh the page and try again.";
          }.bind(this)
        );
    },
    /**
     * This method is like the cardstream server
     *  posting the payment to the webhook url.
     *
     *  - so we can see what cardstream sees and also
     *    allows a place to verify the response signature
     *    in our example..
     */
    testSignature(item) {
      ajax
        .post("/pay/webhook", item)
        .done(
          function(data) {
            this.signature_test = {
              type: "text-" + (data.error ? "danger" : "success"),
              message: data.error
                ? '<i class="fa fa-times"></i> Signature is invalid!'
                : '<i class="fa fa-check"></i> Signature is valid!'
            };
          }.bind(this)
        )
        .fail(
          function(err) {
            this.state.errors.global = "Failed to post to webhook endpoint.";
          }.bind(this)
        );
    }
  }
});
