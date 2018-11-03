const Web3 = require('web3');
const smartcarabi = require('./../contracts/smartCar.js').abi;
const bin = require('./../contracts/smartCar.js').bin;
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = function (app, db) {

  app.post('/string/fromHex', (req, res) => {
    var str = web3.toAscii(req.body.str);
    res.send(str);
  });

  app.post('/string/toHex', (req, res) => {
    var str = web3.fromAscii(req.body.str, 32);
    res.send(str)
  });

  app.post('/decimal/fromHex', (req, res) => {
    var number = web3.toDecimal(req.body.num);
    res.send({ result: number })
  });

  app.post('/decimal/toHex', (req, res) => {
    var number = web3.fromDecimal(req.body.num);
    res.send(number)
  });

  app.post('/getBalance', (req, res) => {
    var balance = web3.eth.getBalance(req.body.account);
    res.send({ result: balance })
  });


  app.post('/getBalanceInEther', (req, res) => {
    var balance = web3.fromWei(web3.eth.getBalance(req.body.account));
    res.send({ result: balance })
  });


  app.post('/getAccounts', (req, res) => {
    var accounts = web3.eth.accounts;
    res.send({ result: accounts })
  });

  app.post('/account/signin', (req, res) => {
    var result = web3.personal.unlockAccount(req.body.account, req.body.pass, 600);
    res.send({ result: result })
  });


  app.post('/account/create', (req, res) => {
    var result = web3.personal.newAccount(req.body.pass, function (err, res) { console.log("error" + err); console.log("res" + res); });
    res.send({ result: result })
  });


  app.post('/ether/send', (req, res) => {
    var result = web3.eth.sendTransaction({
      from: req.body.from,
      to: req.body.to,
      value: req.body.value
    });
    res.send({ result: result })
  });



  app.post('/transactions/receipt', (req, res) => {
    var result = web3.eth.getTransactionReceipt(req.body.hash);
    res.send({ result: result })
  }); 

  app.post('/contract/smartcar/function/carValue', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.carValue();
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/carSigner', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.carSigner();
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/licensePlate', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.licensePlate();
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/owners', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.owners();
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/ownersBalance', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.ownersBalance(req.body.account);
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/balanceToDistribute', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.balanceToDistribute();
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/carShares', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);

    var result = stringHolder.carShares(stringHolder.owners());
    res.send({ result: result })
  });

  app.post('/contract/smartcar/function/setOwners', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);
    web3.personal.unlockAccount(req.body.account, req.body.pass, 600);   
    var arr = req.body.addresses.split(',');     
    var result = stringHolder.setOwners(arr, {from: req.body.account, gas: 1000000});

    res.send({ result: result });
  });

  app.post('/contract/smartcar/function/estimateGas', (req, res) => {      
    var methodSignature = web3.eth.abi.encodeFunctionSignature("setOwners(address[] _owners)");
    var messageHex = web3.fromAscii(message, 32);
    var encodedParameter = web3.eth.abi.encodeParameter("address[]", messageHex);
    var data = methodSignature //method signature
    + encodedParameter.substring(2); //hex of input string without '0x' prefix

    web3.eth.estimateGas({
      from: req.body.account, 
      data: data,
      to: req.body.address
  }, function(err, estimatedGas) {
    if (err) console.log(err);
    console.log(estimatedGas);
    res.send({ result: estimatedGas })
    cb(estimatedGas, err);
  });
  });

  app.post('/contract/smartcar/function/purchaseShare', (req, res) => {    
    var contract = web3.eth.contract(smartcarabi);
    var stringHolder = contract.at(req.body.address);
    web3.personal.unlockAccount(req.body.account, req.body.pass, 600);

    var result = stringHolder.purchaseShare(req.body.value,{from: req.body.account, gas: 1000000});
    res.send({ result: result })
  });

  app.post('/contract/smartcar/create', (req, res) => {
    //"0x783130357975313734" - x105yu174
    //value "1000000000000000"
    var paramsInHex = "783130357975313734000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000";    
    var binWithParams = bin+paramsInHex;
    var contract = web3.eth.contract(smartcarabi);
    web3.personal.unlockAccount(req.body.account, req.body.pass, 600);
    var uselessWorker = contract.new({ from: req.body.account, data: binWithParams, gas: 1000000 });
    res.send({ result: uselessWorker.transactionHash, contract: contract.options });    
  });

  app.post('/mongo/contracts/add', (req, res) => {
    const contract = { text: req.body.transactionHash, title: req.body.contractName };
    db.collection('contracts').insert(contract, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred. ' + err });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  app.post('/mongo/errors/add', (req, res) => {
    const error = { text: req.body.name, title: req.body.text };
    db.collection('errors').insert(error, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred. ' + err });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  app.post('/mongo/test', (req, res) => {
    SendPostRequest(req.body.arg1, req.body.arg2);
    res.send({ result: 'ok' })
  });

  function SendPostRequest(arg1, arg2) {
    var request = require('request');

    request.post(
      'http://178.62.249.252:9000/mongo/contracts/add',
      { json: { transactionHash: String(arg1), contractName: String(arg2) } },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body)
        }
      }
    );
  }
}
