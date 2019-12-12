'use strict';
class ZP extends Joiner {
constructor() {
super();
this.settings.interval_from.min = 9;
this.websiteUrl = 'https://www.zeepond.com';
this.authContent = 'My Account';
this.authLink = 'https://www.zeepond.com/cb-login';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) };
this.settings.skip_after = { type: 'checkbox', trans: this.transPath('skip_after'), default: this.getConfig('skip_after', true) };
this.settings.blacklist_on = { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) };
this.settings.check_all = { type: 'checkbox', trans: this.transPath('check_all'), default: this.getConfig('check_all', false) };
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.settings.autostart = { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) };
this.settings.check_in_steam = { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) };
this.withValue = false;
delete this.settings.pages;
super.init();
this.log(this.logLink('https://www.zeepond.com/cb-login', Lang.get('service.login')) + '<br>' + Lang.get('service.zp.login'));
}
authCheck(callback) {
if (GJuser.zp === '') {
GJuser.zp = ',';
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'zp.txt')) {
let zpdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'zp.txt');
if (zpdata.length > 1 && zpdata.length < 20000) {
GJuser.zp = zpdata.toString();
}
}
}
$.ajax({
url: 'https://www.zeepond.com',
success: function (html) {
html = html.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload').replace(/<script/gi, '<noload');
callback(1);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/ZP.png',
username: 'ZP User'
};
$.ajax({
url: 'https://www.zeepond.com',
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
userData.avatar = $(data).find('.profile-pic').attr('style').replace('background-color:transparent; background-image:url(', '').replace(');', '');
userData.username = 'Profile';
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let zptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = zptimer;
}
_this.skip = false;
_this.url = 'https://www.zeepond.com';
$.ajax({
url: _this.url + '/zeepond/giveaways/enter-a-competition',
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
let logined = data.indexOf('My Account') >= 0;
if (!logined) {
_this.log(Lang.get('service.ses_not_found'), 'err');
_this.stopJoiner(true);
}
let comp = $(data).find('.bv-item-wrapper'),
zpcurr = 0,
random = Array.from(Array(comp.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (comp.length <= zpcurr || _this.skip || !_this.started) {
if (comp.length <= zpcurr || _this.skip) {
setTimeout(function () {
fs.writeFile(storage.getDataPath().slice(0, -7) + 'zp.txt', GJuser.zp, (err) => { });
}, _this.interval());
}
if (_this.getConfig('log', true)) {
if (_this.started && !_this.skip) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}
return;
}
let zpnext = _this.interval(),
zprnd = random[zpcurr],
zpcomp = comp.eq(zprnd),
zplink = _this.url + zpcomp.find('.bv-item-image a').attr('href'),
zpnam = zplink.replace('https://www.zeepond.com/zeepond/giveaways/enter-a-competition/', ''),
njoin = 0;
if (GJuser.zp.includes(',' + zpnam + '(z=') && !_this.getConfig('check_all', false)) {
let zpdga = parseInt(GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0]),
zpdtnow = new Date();
zpdtnow.setDate(zpdtnow.getUTCDate());
zpdtnow.setHours(zpdtnow.getUTCHours() + 11);
let zpdnow = zpdtnow.getDate();
if (zpdnow === zpdga) {
njoin = 3;
}
}
if (GJuser.zp.includes(',' + zpnam + '(s),') && _this.getConfig('check_in_steam', true)) {
njoin = 1;
}
if (GJuser.zp.includes(',' + zpnam + '(b),') && _this.getConfig('blacklist_on', false)) {
njoin = 2;
}
if (_this.getConfig('log', true) && njoin > 0) {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpnam.replace(/-/g, ' ')), 'chk');
if (njoin === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (njoin === 2) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
if (njoin === 3) {
_this.log(Lang.get('service.time'), 'skip');
}
}
if (njoin === 0) {
$.ajax({
url: zplink,
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let entered = html.indexOf('You have already entered today') >= 0,
enter = html.indexOf('>Enter this competition<') >= 0,
zpname = zpnam.replace(/-/g, ' '),
zpsteam = '';
if (enter || entered) {
zpname = $(html).find('.mycompetition .form-group .span8 > h1').text().trim();
zpsteam = html.substring(html.indexOf('href="https://store.steam')+6, html.indexOf('</a></p>')).slice(0, 55);
}
let zpown = 0,
zpapp = 0,
zpsub = 0,
zpid = '???',
zpstm = '';
if (!zpsteam.includes('https://store.steam')) {
zpsteam = undefined;
}
if (!enter && !entered) {
zpown = 6;
let zpdtskp = new Date();
zpdtskp.setDate(zpdtskp.getUTCDate());
zpdtskp.setHours(zpdtskp.getUTCHours() + 11);
let zpdskp = ('0' + zpdtskp.getDate().toString()).slice(-2);
if (GJuser.zp.includes(',' + zpnam + '(z=')) {
let zpdga = GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0];
GJuser.zp = GJuser.zp.replace(',' + zpnam + '(z=' + zpdga, ',' + zpnam + '(z=' + zpdskp);
}
else {
GJuser.zp = GJuser.zp + zpnam + '(z=' + zpdskp + '),';
}
}
if (entered) {
if (_this.getConfig('skip_after', true)) {
_this.skip = true;
}
zpown = 5;
let zpdtchk = new Date();
zpdtchk.setDate(zpdtchk.getUTCDate());
zpdtchk.setHours(zpdtchk.getUTCHours() + 11);
let zpdchk = ('0' + zpdtchk.getDate().toString()).slice(-2);
if (GJuser.zp.includes(',' + zpnam + '(z=')) {
let zpdga = GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0];
GJuser.zp = GJuser.zp.replace(',' + zpnam + '(z=' + zpdga, ',' + zpnam + '(z=' + zpdchk);
}
else {
GJuser.zp = GJuser.zp + zpnam + '(z=' + zpdchk + '),';
}
}
if (zpsteam !== undefined) {
if (zpsteam.includes('app/')) {
zpapp = parseInt(zpsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'app/' + zpapp;
zpstm = 'https://store.steampowered.com/app/' + zpapp;
}
if (zpsteam.includes('sub/')) {
zpsub = parseInt(zpsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'sub/' + zpsub;
zpstm = 'https://store.steampowered.com/sub/' + zpsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), 'err');
zpown = 2;
}
if (GJuser.ownapps.includes(',' + zpapp + ',') && zpapp > 0) {
zpown = 1;
}
if (GJuser.ownsubs.includes(',' + zpsub + ',') && zpsub > 0) {
zpown = 1;
}
if (zpown === 1) {
GJuser.zp = GJuser.zp + zpnam + '(s),';
}
}
if (GJuser.black.includes(zpid + ',') && _this.getConfig('blacklist_on', false)) {
GJuser.zp = GJuser.zp + zpnam + '(b),';
zpown = 4;
}
}
if (_this.getConfig('log', true)) {
if (zpstm !== '') {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|' + _this.logLink(zpstm, zpid) + '|  ' + _this.logLink(zplink, zpname) + _this.logBlack(zpid), 'chk');
}
else {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpname), 'chk');
}
if (entered && zpown === 5) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
if (zpown === 6) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
if (zpown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (zpown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
}
if (enter && zpown === 0) {
let tmout = Math.floor(Math.random() * Math.floor(zpnext / 3)) + Math.floor(zpnext / 3);
setTimeout(function () {
$.ajax({
url: zplink + '/enter_competition',
success: function (response) {
response = $(response.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let zpdtnew = new Date();
zpdtnew.setDate(zpdtnew.getUTCDate());
zpdtnew.setHours(zpdtnew.getUTCHours() + 11);
let zpdnew = ('0' + zpdtnew.getDate().toString()).slice(-2);
if (GJuser.zp.includes(',' + zpnam + '(z=')) {
let zpdold = GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0];
GJuser.zp = GJuser.zp.replace(',' + zpnam + '(z=' + zpdold, ',' + zpnam + '(z=' + zpdnew);
}
else {
GJuser.zp = GJuser.zp + zpnam + '(z=' + zpdnew + '),';
}
if (_this.getConfig('log', true)) {
if (zpstm !== '') {
_this.log(Lang.get('service.entered_in') + '|' + (zprnd + 1) + '№|' + _this.logLink(zpstm, zpid) + '|  ' + _this.logLink(zplink, zpname) + _this.logBlack(zpid), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpname), 'enter');
}
}
if (!_this.getConfig('log', true)) {
if (zpstm !== '') {
_this.log(Lang.get('service.entered_in') + _this.logLink(zplink, zpname) + _this.logBlack(zpid), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(zplink, zpname), 'enter');
}
}
}
});
}, tmout);
}
}
});
}
else {
zpnext = 100;
}
zpcurr++;
setTimeout(giveawayEnter, zpnext);
}
giveawayEnter();
}
});
}
}
