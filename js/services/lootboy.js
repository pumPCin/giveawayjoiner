'use strict';
class LootBoy extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.lootboy.de';
this.authContent = '';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/LootBoy';
this.auth = Lang.get('service.wiki') + 'LootBoy';
this.withValue = false;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://www.lootboy.de',
success: function () {
callback(1);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/LootBoy.png',
username: 'LootBoy'
};
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let lbtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = lbtimer;
}
_this.lburl = 'https://api.lootboy.de';
_this.url = 'https://www.lootboy.de';
let lbcurr = 0;
_this.check = true;
let lbua = _this.ua;
function giveawayEnter() {
let lbnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'LootBoy', 'srch');
}
return;
}
lbua = _this.ua;
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '_ua.txt') && lbcurr > 0) {
lbua = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '_ua.txt').toString();
}
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '.txt') && lbcurr > 0) {
let lbdata = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '.txt').toString();
let lbd = lbdata.split(','),
lbauth = lbd[0],
lbbrr = lbd[1];
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'lootboy' + lbcurr + '.txt', 'info');
if (lbua !== _this.ua) {
_this.log(lbua, 'skip');
}
}
if (lbdata.includes('Bearer') && lbdata.includes(',')) {
rq({
method: 'GET',
url: _this.lburl + '/v2/users/' + lbauth,
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url,
}
})
.then((stats) => {
let stat = stats.data;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + stat.username + ':' + Lang.get('service.gems') + '- ' + stat.lootgemBalance + ',' + Lang.get('service.coins') + '- ' + stat.lootcoinBalance);
}
setTimeout(function () {
rq({
method: 'PUT',
url: _this.lburl + '/v2/users/self/appStart',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url,
}
})
.then((coins) => {
let coin = coins.data;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Coins', 'chk');
}
if (coin.newLootcoinBalance - stat.lootcoinBalance > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + '- ' + (coin.newLootcoinBalance - stat.lootcoinBalance), 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.done') + Lang.get('service.coins') + '- ' + (coin.newLootcoinBalance - stat.lootcoinBalance), 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
}, 1000);
setTimeout(function () {
rq({
method: 'GET',
url: _this.lburl + '/v1/comics?lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/comics',
}
})
.then((comics) => {
let lbcomics = comics.data;
rq({
method: 'GET',
url: _this.lburl + '/v1/comics/readComics?lang=en',
headers: {
'authority': 'api.lootboy.de',
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics',
}
})
.then((readed) => {
let lbreaded = JSON.stringify(readed.data);
for (let i = 0; i < lbcomics.length; i++) {
lbcomics[i].have = lbreaded.includes(lbcomics[i].id);
}
lbcomics = lbcomics.filter(cmc => cmc.have === false);
if (lbcomics.length > 4) {
lbcomics.length = 4;
}
if (lbcomics.length === 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.no_offer') + 'Read Comics', 'cant');
}
}
else {
lbcomics.forEach(function(comic) {
rq({
method: 'PUT',
url: _this.lburl + '/v1/comics/' + comic.id + '/read?lang=en',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics/' + comic.id,
}
})
.then((comreads) => {
let comread = comreads.data;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Comics #' + comic.number + ' ' + comic.title, 'chk');
}
if (comread.gotBonus) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + '- ' + comread.lootcoinBonus, 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.coins') + '- ' + comread.lootcoinBonus, 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
});
}
});
});
}, 2000);
setTimeout(function () {
rq({
method: 'GET',
url: _this.lburl + '/v1/offers?country=&platform=web&lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((offers) => {
let lboffers = offers.data;
rq({
method: 'GET',
url: _this.lburl + '/v1/offers/taken?lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((taken) => {
let lbtaken = JSON.stringify(taken.data.offers);
for (let i = 0; i < lboffers.length; i++) {
lboffers[i].have = lbtaken.includes(lboffers[i].id);
}
lboffers = lboffers.filter(off => off.have === false);
if (lboffers.length === 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.no_offer') + 'Diamonds Quests', 'cant');
}
}
else {
lboffers.forEach(function(offer) {
rq({
method: 'PUT',
url: _this.lburl + '/v1/offers/' + offer.id + '?lang=en',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((gems) => {
let gem = gems.data;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim(), 'chk');
}
if (!gem.alreadyTaken) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.gems') + '- ' + offer.diamondBonus, 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.done') + Lang.get('service.gems') + '- ' + offer.diamondBonus, 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
});
}
});
});
}, 4000);
})
.catch((error) => {
_this.log(Lang.get('service.ses_not_found') + ' - ' + Lang.get('service.session_expired'), 'err');
});
}
else {
_this.log(Lang.get('service.dt_err'), 'err');
}
}
else {
if (lbcurr > 0) {
_this.check = false;
if (lbcurr === 1) {
fs.writeFile(dirdata + 'lootboy1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/lootboy1.txt', 'err');
_this.stopJoiner(true);
}
}
}
lbcurr++;
setTimeout(giveawayEnter, lbnext);
}
giveawayEnter();
}
}
