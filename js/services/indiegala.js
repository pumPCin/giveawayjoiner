'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.authContent = 'My Profile';
this.websiteUrl = 'https://www.indiegala.com';
this.authLink = 'https://www.indiegala.com/login';
this.settings.ending = { type: 'number', trans: this.transPath('ending'), min: 0, max: 720, default: this.getConfig('ending', 0) };
this.settings.min_level = { type: 'number', trans: this.transPath('min_level'), min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: this.transPath('max_level'), min: this.getConfig('min_level', 0), max: 8, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: this.transPath('min_cost'), min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: this.getConfig('min_cost', 0), max: 240, default: this.getConfig('max_cost', 0) };
this.settings.ending_first = { type: 'checkbox', trans: this.transPath('ending_first'), default: this.getConfig('ending_first', false) };
this.settings.blacklist_on = { type: 'checkbox', trans: this.transPath('blacklist_on'), default: this.getConfig('blacklist_on', false) };
this.settings.sort_by_level = { type: 'checkbox', trans: this.transPath('sort_by_level'), default: this.getConfig('sort_by_level', false) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
this.settings.sbl_ending_ig = { type: 'checkbox', trans: this.transPath('sbl_ending_ig'), default: this.getConfig('sbl_ending_ig', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
super.init();
this.log(this.trans('captcha') + this.logLink('https://www.indiegala.com/giveaways', 'captcha'), true);
}
authCheck(callback) {
if (GJuser.ig === '') {
$.ajax({
url: 'https://www.indiegala.com',
success: function () {
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
dataType: 'json',
success: function (data) {
if (data.steamnick) {
GJuser.ig = '?user_id=' + data.profile;
$.ajax({
url: 'https://www.indiegala.com/giveaways/get_user_level_and_coins',
dataType: 'json',
success: function (data) {
GJuser.iglvl = data.current_level;
}
});
callback(1);
}
else {
GJuser.ig = '';
callback(0);
}
},
error: function () {
callback(-1);
}
});
}
});
}
else {
callback(1);
}
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/IndieGala.png',
username: 'IG User',
value: 0
};
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function (data) {
userData.avatar = data.steamavatar.replace('fb1.jpg', 'fb1_full.jpg');
userData.username = data.steamnick;
userData.value = data.silver_coins_tot;
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1;
_this.lvlmax = _this.getConfig('max_level', 0);
_this.lvlmin = _this.getConfig('min_level', 0);
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = _this.getConfig('sort_by_level', false);
_this.ending = _this.getConfig('ending', 0);
_this.ending_first = _this.getConfig('ending_first', false);
_this.sort_after = false;
_this.url = 'https://www.indiegala.com';
$.ajax({
url: _this.url + '/giveaways/library_completed',
type: 'POST',
data: '{"list_type":"tocheck","page":1}',
dataType: 'json'
});
$.ajax({
url: _this.url + '/giveaways/check_if_won_all',
success: function (html) {
if (html.indexOf('Incapsula incident') >= 0) {
GJuser.ig = '';
_this.log(_this.trans('captcha') + _this.logLink(_this.url + '/giveaways', 'captcha'), true);
_this.stopJoiner(true);
}
else {
let igwon = $(html).find('p').eq(1).text().trim();
if (igwon !== 'You did not win... :(') {
igwon = igwon.replace('Congratulations! You won','').replace('Giveaways','').trim();
_this.log(_this.logLink(_this.url + '/profile', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + igwon + ')'), true);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
}
});
$.ajax({
url: _this.url + '/claimprofile/sync_username_avatar',
type: 'POST'
});
if (_this.check === undefined) {
setTimeout(function () {
_this.check = 1;
}, 10000);
}
if (GJuser.iglvl === 0) {
_this.sort = false;
}
if (_this.ending_first && _this.ending !== 0 && _this.sort) {
_this.sort = false;
_this.sort_after = true;
}
if (_this.lvlmax > GJuser.iglvl || _this.lvlmax === 0) {
_this.lvlmax = GJuser.iglvl;
}
if (_this.lvlmin > GJuser.iglvl) {
_this.lvlmin = GJuser.iglvl;
}
_this.lvl = _this.lvlmax;
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
if (_this.sort && page > _this.pagemax && _this.lvl > _this.getConfig('min_level', 0)) {
_this.lvl = _this.lvl - 1;
_this.pagemax = _this.getConfig('pages', 1);
page = 1;
_this.enterOnPage(page, callback);
}
};
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
if (!_this.sort && GJuser.iglvl > 0) {
_this.lvl = 'all';
}
$.ajax({
url: _this.url + '/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=' + _this.lvl,
success: function (data) {
let tickets = $(JSON.parse(data).content).find('.tickets-col');
let igcurr = 0;
function giveawayEnter() {
if (tickets.length < 12) {
_this.pagemax = page;
}
if (tickets.length <= igcurr || !_this.started || _this.curr_value === 0) {
if (_this.getConfig('log', true)) {
if (tickets.length < 12 && !_this.sort) {
_this.log(Lang.get('service.reach_end'));
}
if (_this.sort) {
_this.log(Lang.get('service.checked') + _this.lvl + 'L-' + page + '#');
}
else {
_this.log(Lang.get('service.checked') + page + '#');
}
}
if (_this.sort_after && page === _this.pagemax) {
page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = true;
_this.lvl = _this.lvlmax + 1;
_this.sort_after = false;
}
if (callback) {
callback();
}
return;
}
let ignext = _this.interval();
let ticket = tickets.eq(igcurr),
price = ticket.find('.ticket-price strong').text(),
level = parseInt(ticket.find('.type-level span').text().replace('+', '')),
single = ticket.find('.extra-type .fa-clone').length === 0,
id = ticket.find('.ticket-right .relative').attr('rel'),
igsteam = ticket.find('.giv-game-img').attr('data-src'),
name = ticket.find('h2 a').text(),
time = ticket.find('.box_pad_5 > .info-row:nth-of-type(5)').text(),
entered = false,
enterTimes = 0;
if (time.includes('day')) {
time = 24 * (time.replace('day left','').replace('days left','').trim());
}
else {
if (time.includes('hour')) {
time = time.replace('hour left','').replace('hours left','').trim();
}
else {
if (time.includes('minute')) {
time = 0;
}
}
}
if (single) {
entered = ticket.find('.giv-coupon').length === 0;
}
else {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
entered = enterTimes > 0;
}
if (
(entered) ||
(_this.lvlmax < level && _this.lvlmax !== 0) ||
(GJuser.iglvl < level) ||
(_this.lvlmin > level) ||
(_this.curr_value < price) ||
(price < _this.getConfig('min_cost', 0) && _this.getConfig('min_cost', 0) !== 0) ||
(price > _this.getConfig('max_cost', 0) && _this.getConfig('max_cost', 0) !== 0) ||
(time > _this.ending && _this.ending !== 0 && !_this.sort) ||
(time > _this.ending && _this.ending !== 0 && _this.sort && !_this.getConfig('sbl_ending_ig', false))
)
{
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (igcurr + 1) + '№|' + time + 'h|' + level + 'L|' + price + '$|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name));
if (entered) {
_this.log(Lang.get('service.already_joined'));
}
if (!entered && _this.curr_value < price) {
_this.log(Lang.get('service.points_low'));
}
if (!entered && _this.curr_value >= price) {
_this.log(Lang.get('service.skipped'));
}
}
ignext = 50;
}
else {
let igown = 0,
igapp = 0,
igsub = 0,
igid = '???',
igstm = '';
if (igsteam.includes('apps/')) {
igapp = parseInt(igsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'app/' + igapp;
igstm = 'https://store.steampowered.com/app/' + igapp;
}
if (igsteam.includes('sub/')) {
igsub = parseInt(igsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'sub/' + igsub;
igstm = 'https://store.steampowered.com/sub/' + igsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), true);
igown = 2;
}
if (GJuser.ownapps.includes(',' + igapp + ',') && igapp > 0) {
igown = 1;
}
if (GJuser.ownsubs.includes(',' + igsub + ',') && igsub > 0) {
igown = 1;
}
}
if (GJuser.black.includes(igid + ',') && _this.getConfig('blacklist_on', false)) {
igown = 4;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (igcurr + 1) + '№|' + time + 'h|' + level + 'L|' + price + '$|' + _this.logLink(igstm, igid) + '|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name));
if (igown === 1) {
_this.log(Lang.get('service.have_on_steam'));
}
if (igown === 4) {
_this.log(Lang.get('service.blacklisted'));
}
}
if (igown === 0) {
$.ajax({
type: 'POST',
url: _this.url + '/giveaways/new_entry',
contentType: 'application/json; charset=utf-8',
dataType: 'json',
data: JSON.stringify({giv_id: id, ticket_price: price}),
success: function (data) {
if (data.status === 'ok') {
_this.setValue(data.new_amount);
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (igcurr + 1) + '№|' + time + 'h|' + level + 'L|' + price + '$|' + _this.logLink(igstm, igid) + '|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name));
}
}
});
}
else {
ignext = 50;
}
}
igcurr++;
setTimeout(giveawayEnter, ignext);
}
giveawayEnter();
}
});
}
}
