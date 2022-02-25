import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LiquidityLockerService {

  constructor() { }
}

// var acc = {
//     address: undefined,
//     balance: undefined,
//     coupon_list: [],

//     addr: function() {
//         if (this.address != undefined)
//             return this.address[0];
//     },

//     get_address: async function() {
//         if ((window.ethereum === "undefined") || (Web3.givenProvider == null))
//             return;

//         this.address = await ethereum.request({
//             method: "eth_requestAccounts"
//         });
//         this.make_checksum_addresses();
//     },

//     get_balance: async function() {
//         if ((window.ethereum === "undefined") || (Web3.givenProvider == null) || (this.address == undefined))
//             return;

//         this.balance = await web3.eth.getBalance(this.addr());
//     },

//     make_checksum_addresses: function() {
//         for (var i = 0; i < this.address.length; i++)
//             this.address[i] = web3.utils.toChecksumAddress(this.addr());
//     }
// };

// function chain_id_to_index(_id) {
//     for (var i = 0; i < chains.length; i++)
//         if (chains[i].id == _id)
//             return i;

//     return -1;
// }

// function chain_is_supported(_id) {
//     return (chain_id_to_index(_id) == -1) ? false : true;
// }

// async function init_chain() {
//     for (var prop in contracts)
//         if (chains[chain_id_to_index(current_chain_id)].contracts.hasOwnProperty(prop)) {
//             contracts[prop].address = chains[chain_id_to_index(current_chain_id)].contracts[prop];
//             contracts[prop].contract = new web3.eth.Contract(contracts[prop].abi,contracts[prop].address);
//         }

//     await acc.get_address();
//     await acc.get_balance();
//     refresh_account();
// }

// async function init_liq_lock_data() {
//     await load_test_tokens();
//     fee_token = test_tokens[3];

//     await load_user_tokens();
//     await load_locks();

//     get_user_fee();
// }

// //========================================================================================================================

// //========================================================================================================================
// //
// //	blockchain(ish) helper functions
// //
// //========================================================================================================================

// function nice_currency(_val) {
//     return Math.floor(web3.utils.fromWei(String(_val)) * 100) / 100;
// }

// async function refresh_account() {
//     if (acc.addr() != undefined) {
//         $("#address").html(acc.addr());
//     } else
//         $("#address").html("MetaMask error");

//     $("#balance").html(nice_currency(acc.balance) + " ETH");
// }

// async function refresh_balances(_token=undefined) {
//     var list = user_tokens;
//     if (_token != undefined)
//         list = [{
//             token_address: _token
//         }];

//     for (var i = 0; i < list.length; i++)
//         await load_user_tokens(list[i].token_address, false);

//     if (_token == fee_token)
//         get_user_fee();
// }

// var test_tokens;

// async function load_test_tokens() {
//     test_tokens = [];
//     for (var i = 0; i < 4; i++)
//         test_tokens.push(await contracts.token_dispenser.contract.methods.tokens(i).call({
//             from: acc.addr()
//         }));
// }

// async function give_test_token(_index) {
//     $("#give_test_token_status").html("Awaiting user confirmation...");

//     contracts.token_dispenser.contract.methods.giveToken(_index, web3.utils.toWei("100")).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#give_test_token_status").html("Waiting for chain confirmation...");
//         else
//             $("#give_test_token_status").html("");
//     }).on("receipt", async function() {
//         $("#give_test_token_status").html("Success!");
//         refresh_balances(test_tokens[_index]);
//     });
// }

// async function approve_token(_token, _value_to_approve) {
//     var token_contract = new web3.eth.Contract(contracts.erc20.abi,_token);
//     var approved_value = await token_contract.methods.allowance(acc.addr(), contracts.liq_lock.address).call({
//         from: acc.addr()
//     });

//     if (web3.utils.toBN(approved_value).lt(web3.utils.toBN(_value_to_approve))) {
//         var max_approve = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
//         await token_contract.methods.approve(contracts.liq_lock.address, max_approve).send({
//             from: acc.addr()
//         });
//     }
// }

// var fee_token;

// async function get_user_fee() {
//     var token = user_tokens.find(function(_el) {
//         return _el.token_address.toLowerCase() == fee_token.toLowerCase()
//     });
//     if ((token == undefined) || (token.balance == undefined))
//         token = {
//             balance: 0
//         };

//     $("#ebox").html(token.balance);

//     var fee = await contracts.liq_lock.contract.methods.getFee().call({
//         from: acc.addr()
//     });
//     fee = (fee[0] / fee[1]) * 100;

//     $("#fee").html(fee);
// }

// //========================================================================================================================

// //========================================================================================================================
// //
// //	other
// //
// //========================================================================================================================

// $(document).ready(async function() {
//     $.ajaxSetup({
//         cache: false
//     });

//     clock();

//     await web3_connect();
// });

// function radio_handler() {
//     switch ($(this).attr("name")) {
//     case "tokens":
//         {
//             user_tokens_selected = $(this).attr("data-token-index-local");
//             $("#selected_token").html(user_tokens[user_tokens_selected].symbol + " - " + user_tokens[user_tokens_selected].name);
//         }
//         break;

//     case "locks":
//         {
//             locks_selected = $(this).attr("data-lock-index-local");
//         }
//         break;
//     }
// }

// //========================================================================================================================

// //========================================================================================================================
// //
// //	manage tokens list
// //
// //========================================================================================================================

// var user_tokens;
// var user_tokens_selected;

// async function load_user_tokens(_token_addr=undefined, _log=true) {
//     //------------------------------------------------------------------------------------------------------------------------
//     // either fetch list from moralis API, or add single token for further processing
//     //------------------------------------------------------------------------------------------------------------------------

//     var new_tokens;

//     if (_token_addr == undefined) {
//         // load all tokens

//         $("#tokens_list tbody").html("<tr><td colspan=5>Loading all user tokens...</td></tr>");
//         user_tokens = [];

//         var new_tokens = await $.post("moralis.php", {
//             action: "get_tokens",
//             address: acc.addr(),
//             chain: "rinkeby"
//         });

//         if (new_tokens.hasOwnProperty("error") || new_tokens.hasOwnProperty("message")) {
//             $("#tokens_list tbody").html("<tr><td colspan=5 style=\"background-color: #ba7f7f;\">Error loading user tokens (possibly rate limited)!</td></tr>");
//             return;
//         }

//         new_tokens.sort(function(_lhs, _rhs) {
//             return _lhs.name.localeCompare(_rhs.name);
//         });
//     } else {
//         // load specific token

//         if (_log)
//             $("#manual_status").html("Loading...");

//         new_tokens = [{
//             token_address: _token_addr
//         }];
//     }

//     if (new_tokens.length == 0) {
//         $("#tokens_list tbody").html("<tr><td colspan=5>You seem to have no tokens - Try adding manually!</td></tr>");
//         return;
//     }

//     //------------------------------------------------------------------------------------------------------------------------

//     //------------------------------------------------------------------------------------------------------------------------
//     // get tokens data & display list
//     //------------------------------------------------------------------------------------------------------------------------

//     if (_token_addr == undefined)
//         $("#tokens_list tbody").html("");

//     for (var i = 0; i < new_tokens.length; i++) {

//         if (new_tokens[i].balance == undefined) {
//             var token_contract = new web3.eth.Contract(contracts.erc20.abi,new_tokens[i].token_address);

//             new_tokens[i].balance = await token_contract.methods.balanceOf(acc.addr()).call({
//                 from: acc.addr()
//             });
//             new_tokens[i].symbol = await token_contract.methods.symbol().call({
//                 from: acc.addr()
//             });
//             new_tokens[i].name = await token_contract.methods.name().call({
//                 from: acc.addr()
//             });
//         }

//         new_tokens[i].token_address = web3.utils.toChecksumAddress(new_tokens[i].token_address);
//         new_tokens[i].balance = Number(web3.utils.fromWei(new_tokens[i].balance)).toFixed(2);

//         var index = user_tokens.findIndex(function(_el) {
//             return _el.token_address.toLowerCase() == new_tokens[i].token_address.toLowerCase()
//         });
//         var replace = false;

//         if (index == -1) {
//             user_tokens.push(new_tokens[i]);
//             index = user_tokens.length - 1;
//         } else {
//             user_tokens[index] = JSON.parse(JSON.stringify(new_tokens[i]));
//             replace = true;
//         }

//         var out = `
// 						<tr>
// 							<td>
// 								<input type="radio" id="token${index}" data-token-index-local="${index}" name="tokens">
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="token${index}">
// 									${user_tokens[index].symbol}
// 								</label>
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="token${index}">
// 									${user_tokens[index].name}
// 								</label>
// 							</td>
// 							<td>
// 								<label for="token${index}">
// 									${user_tokens[index].balance}
// 								</label>
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="token${index}">
// 									${user_tokens[index].token_address}
// 								</label>
// 							</td>
// 						</tr>
// 					`.replace(/[\t\n]/g, "");

//         if (!replace)
//             $("#tokens_list tbody").append(out);
//         else
//             $("#tokens_list input#token" + index).closest("tr").replaceWith(out);
//     }

//     $("input:radio[name='tokens']").off("change");
//     $("input:radio[name='tokens']").on("change", radio_handler);

//     if ((_token_addr != undefined) && _log)
//         $("#manual_status").html("Loaded " + new_tokens[0].symbol + "!");

//     //------------------------------------------------------------------------------------------------------------------------
// }

// function manual_load_token() {
//     var token = $("#manual_token").val();

//     if (web3.utils.isAddress(token))
//         load_user_tokens(token);
//     else
//         $("#manual_status").html("Invalid address!");
// }

// //========================================================================================================================

// //========================================================================================================================
// //
// //	manage locks list
// //
// //========================================================================================================================

// var locks;
// var locks_selected;

// async function load_locks(_show_all=false) {
//     $("#locks_list tbody").html(`<tr><td colspan=6>Loading ${_show_all ? "all" : "own"} locks...</td></tr>`);

//     var events_filter = {
//         fromBlock: 1
//     };
//     if (!_show_all)
//         events_filter.filter = {
//             owner: acc.addr()
//         };

//     var event_create = await contracts.liq_lock.contract.getPastEvents("LockCreate", events_filter);
//     var event_transfer = await contracts.liq_lock.contract.getPastEvents("LockTransfer", events_filter);
//     //	var event_empty		= await contracts.liq_lock.contract.getPastEvents("LockEmpty", event_filter);

//     var user_locks_indexes = [];

//     for (var i = 0; i < event_create.length; i++)
//         user_locks_indexes.push(event_create[i].returnValues.index);

//     for (var i = 0; i < event_transfer.length; i++)
//         if (event_transfer[i].returnValues.oldOwner == acc.addr()) {
//             var index = user_locks_indexes.findIndex(function(_el) {
//                 return _el == event_transfer[i].returnValues.index
//             });
//             user_locks_indexes.splice(index, 1);
//         } else if (event_transfer[i].returnValues.newOwner == acc.addr())
//             user_locks_indexes.push(event_transfer[i].returnValues.index);

//     user_locks_indexes.sort(function(_lhs, _rhs) {
//         return _lhs - _rhs;
//     });

//     if (user_locks_indexes.length == 0) {
//         $("#locks_list tbody").html(`<tr><td colspan=6>${_show_all ? "There are" : "You have"} no locks.</td></tr>`);
//         return;
//     }

//     $("#locks_list tbody").html("");
//     locks = [];

//     for (var i = 0; i < user_locks_indexes.length; i++) {
//         var lock = await contracts.liq_lock.contract.methods.getLock(user_locks_indexes[i]).call({
//             from: acc.addr()
//         });

//         var token_contract = new web3.eth.Contract(contracts.erc20.abi,lock.token);
//         var symbol = await token_contract.methods.symbol().call({
//             from: acc.addr()
//         });

//         locks.push({
//             index: user_locks_indexes[i],
//             owner: lock.owner,
//             token_address: lock.token,
//             token_symbol: symbol,
//             value: Number(web3.utils.fromWei(lock.value)).toFixed(2),
//             expiration_time: lock.expirationTime
//         });

//         var is_own = locks[i].owner.toLowerCase() == acc.addr().toLowerCase();
//         var is_expired = locks[i].expiration_time <= now();
//         var is_empty = lock.value == 0;

//         var out = `
// 						<tr ${(!is_own || is_empty) ? "class=\"tr-disabled\"" : ""}>
// 							<td>
// 								<input type="radio" id="lock${i}" data-lock-index-local="${i}" name="locks" ${(!is_own || is_empty) ? "disabled" : ""}>
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="lock${i}">
// 									${locks[i].owner}
// 								</label>
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="lock${i}">
// 									${locks[i].token_symbol}
// 								</label>
// 							</td>
// 							<td style="text-align: center;">
// 								<label for="lock${i}">
// 									${locks[i].token_address}
// 								</label>
// 							</td>
// 							<td>
// 								<label for="lock${i}">
// 									${locks[i].value}
// 								</label>
// 							</td>
// 							<td style="text-align: center; ${(!is_own || is_empty) ? "" : `background-color: ${is_expired ? "#7fba94" : "#ba7f7f"}`}">
// 								<label for="lock${i}">
// 									${new Date(locks[i].expiration_time * 1000).toLocaleString(undefined, {
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false
//         })}
// 								</label>
// 							</td>
// 						</tr>
// 					`.replace(/[\t\n]/g, "");

//         $("#locks_list tbody").append(out);
//     }

//     $("input:radio[name='locks']").off("change");
//     $("input:radio[name='locks']").on("change", radio_handler);
// }

// var showing_all_locks = false;

// function toggle_all_locks(_btn) {
//     $(_btn).html(`Show ${showing_all_locks ? "all" : "own"}`);
//     showing_all_locks = !showing_all_locks;

//     load_locks(showing_all_locks);
// }

// //========================================================================================================================

// //========================================================================================================================
// //
// //	liq lock UI <> smart contract
// //
// //========================================================================================================================

// async function lock_create() {
//     $("#lock_status").html("");

//     if (user_tokens_selected == undefined) {
//         $("#lock_status").html("No token selected!");
//         return;
//     }

//     var value = $("#lock_create_value").val();

//     if (isNaN(value) || (value == 0)) {
//         $("#lock_status").html("Invalid value!");
//         return;
//     }

//     var token_contract = new web3.eth.Contract(contracts.erc20.abi,user_tokens[user_tokens_selected].token_address);
//     var balance = Number(web3.utils.fromWei(await token_contract.methods.balanceOf(acc.addr()).call({
//         from: acc.addr()
//     }))).toFixed(2);

//     if (Number(value) > Number(balance)) {
//         $("#lock_status").html("Insufficient balance!");
//         return;
//     }

//     value = web3.utils.toWei(value);

//     var time = Math.floor(new Date($("#lock_create_time").val()).getTime() / 1000);

//     if (isNaN(time) || (time < now())) {
//         $("#lock_status").html("Invalid date / time!");
//         return;
//     }

//     $("#lock_status").html("Awaiting approval...");
//     await approve_token(user_tokens[user_tokens_selected].token_address, value);

//     $("#lock_status").html("Awaiting user confirmation...");

//     contracts.liq_lock.contract.methods.lockCreate(user_tokens[user_tokens_selected].token_address, value, time).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#lock_status").html("Waiting for chain confirmation...");
//         else
//             $("#lock_status").html("");
//     }).on("receipt", async function() {
//         $("#lock_status").html("Successfully created lock!");
//         refresh_balances();
//         load_locks();
//         get_user_fee();
//     });
// }

// async function lock_add() {
//     $("#lock_status").html("");

//     if (locks_selected == undefined) {
//         $("#lock_status").html("No lock selected!");
//         return;
//     }

//     var value = $("#lock_add").val();

//     if (isNaN(value) || (value == 0)) {
//         $("#lock_status").html("Invalid value!");
//         return;
//     }

//     var token_contract = new web3.eth.Contract(contracts.erc20.abi,locks[locks_selected].token_address);
//     var balance = Number(web3.utils.fromWei(await token_contract.methods.balanceOf(acc.addr()).call({
//         from: acc.addr()
//     }))).toFixed(2);

//     if (Number(value) > Number(balance)) {
//         $("#lock_status").html("Insufficient balance!");
//         return;
//     }

//     value = web3.utils.toWei(value);

//     $("#lock_status").html("Awaiting approval...");
//     await approve_token(locks[locks_selected].token_address, value);

//     $("#lock_status").html("Awaiting user confirmation...");

//     contracts.liq_lock.contract.methods.lockAdd(locks[locks_selected].index, value).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#lock_status").html("Waiting for chain confirmation...");
//         else
//             $("#lock_status").html("");
//     }).on("receipt", async function() {
//         $("#lock_status").html("Successfully added to lock!");
//         refresh_balances();
//         load_locks();
//         get_user_fee();
//     });
// }

// function lock_extend() {
//     $("#lock_status").html("");

//     if (locks_selected == undefined) {
//         $("#lock_status").html("No lock selected!");
//         return;
//     }

//     var new_time = Math.floor(new Date($("#lock_extend").val()).getTime() / 1000);

//     if (isNaN(new_time) || (new_time < now())) {
//         $("#lock_status").html("Invalid date / time!");
//         return;
//     }

//     $("#lock_status").html("Awaiting user confirmation...");

//     contracts.liq_lock.contract.methods.lockExtend(locks[locks_selected].index, new_time).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#lock_status").html("Waiting for chain confirmation...");
//         else
//             $("#lock_status").html("");
//     }).on("receipt", async function() {
//         $("#lock_status").html("Successfully extended lock!");
//         load_locks();
//     });
// }

// function lock_transfer() {
//     $("#lock_status").html("");

//     if (locks_selected == undefined) {
//         $("#lock_status").html("No lock selected!");
//         return;
//     }

//     var new_owner = $("#lock_transfer").val();

//     if (!web3.utils.isAddress(new_owner.toLowerCase())) {
//         $("#lock_status").html("Invalid address!");
//         return;
//     }

//     $("#lock_status").html("Awaiting user confirmation...");

//     contracts.liq_lock.contract.methods.lockTransfer(locks[locks_selected].index, new_owner).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#lock_status").html("Waiting for chain confirmation...");
//         else
//             $("#lock_status").html("");
//     }).on("receipt", async function() {
//         $("#lock_status").html("Successfully transferred lock!");
//         load_locks();
//     });
// }

// function lock_withdraw() {
//     $("#lock_status").html("");

//     if (locks_selected == undefined) {
//         $("#lock_status").html("No lock selected!");
//         return;
//     }

//     var value = String(Number($("#lock_withdraw").val()));

//     if (isNaN(value)) {
//         $("#lock_status").html("Invalid value!");
//         return;
//     }

//     value = web3.utils.toWei(value);

//     $("#lock_status").html("Awaiting user confirmation...");

//     contracts.liq_lock.contract.methods.lockWithdraw(locks[locks_selected].index, value).send({
//         from: acc.addr()
//     }, async function(error, result) {
//         if (error == null)
//             $("#lock_status").html("Waiting for chain confirmation...");
//         else
//             $("#lock_status").html("");
//     }).on("receipt", async function() {
//         $("#lock_status").html("Successfully withdrawn from lock!");
//         refresh_balances();
//         load_locks();
//         get_user_fee();
//     });
// }

// //========================================================================================================================

