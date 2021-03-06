'use strict';
class ZP extends Joiner {
constructor() {
super();
this.domain = 'zeepond.com';
this.websiteUrl = 'https://www.zeepond.com/zeepond/giveaways/enter-a-competition';
this.website = 'https://www.zeepond.com';
this.authContent = 'profile-pic';
this.authLink = 'https://www.zeepond.com/cb-login';
this.auth = this.auth + Lang.get('service.zp.login');
this.card = true;
this.dlc = true;
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 20), default: this.getConfig('interval_from', 15) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 15), max: 60, default: this.getConfig('interval_to', 20) };
this.settings.card_only = { type: 'checkbox', trans: 'service.card_only', default: this.getConfig('card_only', false) };
this.settings.skip_dlc = { type: 'checkbox', trans: 'service.skip_dlc', default: this.getConfig('skip_dlc', false) };
this.settings.skip_after = { type: 'checkbox', trans: this.transPath('skip_after'), default: this.getConfig('skip_after', true) };
this.settings.whitelist_nocards = { type: 'checkbox', trans: 'service.whitelist_nocards', default: this.getConfig('whitelist_nocards', false) };
this.settings.skip_skipdlc = { type: 'checkbox', trans: 'service.skip_skipdlc', default: this.getConfig('skip_skipdlc', false) };
this.settings.check_all = { type: 'checkbox', trans: this.transPath('check_all'), default: this.getConfig('check_all', false) };
this.settings.skip_epic = { type: 'checkbox', trans: this.transPath('skip_epic'), default: this.getConfig('skip_epic', false) };
this.settings.skip_origin = { type: 'checkbox', trans: this.transPath('skip_origin'), default: this.getConfig('skip_origin', false) };
this.settings.skip_ns = { type: 'checkbox', trans: this.transPath('skip_ns'), default: this.getConfig('skip_ns', false) };
this.settings.skip_xbox = { type: 'checkbox', trans: this.transPath('skip_xbox'), default: this.getConfig('skip_xbox', false) };
delete this.settings.pages;
super.init();
}
authCheck(callback) {
this.waitAuth = true;
Browser.webContents.on('did-finish-load', () => {
if (this.waitAuth && Browser.getURL().indexOf('https://www.zeepond.com') >= 0) {
Browser.webContents.executeJavaScript('document.querySelector("body").innerHTML')
.then((body) => {
if (body.indexOf('profile-pic') >= 0) {
Browser.webContents.removeAllListeners('did-finish-load');
this.waitAuth = false;
callback(1);
}
else {
Browser.webContents.removeAllListeners('did-finish-load');
this.waitAuth = false;
callback(0);
}
});
}
else {
Browser.webContents.removeAllListeners('did-finish-load');
this.waitAuth = false;
callback(-1);
}
});
Browser.loadURL('https://www.zeepond.com/zeepond/giveaways/enter-a-competition');
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/ZP.png',
username: 'ZP User'
};
if (GJuser.username !== 'User') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
let zptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = zptimer;
_this.dsave = ',';
_this.dload = ',';
if (fs.existsSync(dirdata + 'zp.txt')) {
let zpdata = fs.readFileSync(dirdata + 'zp.txt');
if (zpdata.length > 1) {
_this.dload = zpdata.toString();
}
}
_this.skip = false;
_this.month = 1;
let zpmonth = new Date().getMonth();
if (zpmonth > 2 && zpmonth < 10) {
_this.month = 0;
}
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.zeepond.com';
let data = 'err';
rq({
method: 'GET',
url: _this.url + '/zeepond/giveaways/enter-a-competition',
headers: {
'authority': 'www.zeepond.com',
'user-agent': _this.ua,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'referer': _this.url + '/',
'cookie': _this.cookies
},
responseType: 'document'
})
.then((datas) => {
data = datas.data;
data = data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
})
.finally(() => {
let comp = $(data).find('.bv-item-wrapper'),
zpcurr = 0,
zpcrr = 0,
zparray = Array.from(Array(comp.length).keys());
if (data === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (zparray.length <= zpcurr || _this.skip || !_this.started) {
if (comp.length <= zpcurr || _this.skip) {
if ((new Date()).getDate() !== _this.dcheck && !_this.skip) {
let win = 'err',
zpwon = '';
rq({
method: 'GET',
url: _this.url + '/my-account/my-prizes',
headers: {
'authority': 'www.zeepond.com',
'user-agent': _this.ua,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'referer': _this.url + '/zeepond/giveaways/enter-a-competition',
'cookie': _this.cookies
},
responseType: 'document'
})
.then((wins) => {
win = wins.data;
win = $(win.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
})
.finally(() => {
if (win !== 'err') {
zpwon = win.find('.form-group');
_this.dcheck = (new Date()).getDate();
if (zpwon === undefined) {
zpwon = 0;
}
else {
zpwon = zpwon.length;
}
if (zpwon < _this.won) {
_this.setConfig('won', zpwon);
}
if (zpwon > 0 && zpwon > _this.won) {
_this.log(_this.logLink(_this.url + '/my-account/my-prizes', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (zpwon - _this.won) + ')'), 'win');
_this.logWin(' ZP - ' + (zpwon - _this.won));
_this.setStatus('win');
_this.setConfig('won', zpwon);
if (_this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
}
});
}
setTimeout(() => {
fs.writeFile(dirdata + 'zp.txt', _this.dsave, (err) => { });
_this.log(Lang.get('service.data_saved'), 'info');
}, _this.interval());
}
if (_this.started && !_this.skip) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
if (_this.started) {
setTimeout(() => {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}, _this.interval());
}
return;
}
let zpnext = _this.interval(),
zpcrr = zparray[zpcurr],
zpcomp = comp.eq(zpcrr),
zplink = _this.url + zpcomp.find('.bv-item-image a').attr('href'),
zpnam = zplink.replace('https://www.zeepond.com/zeepond/giveaways/enter-a-competition/', ''),
njoin = 0,
zpblack = '',
zpdtnow = new Date();
zpdtnow.setDate(zpdtnow.getUTCDate());
zpdtnow.setHours(zpdtnow.getUTCHours() + 10 + _this.month);
let zpdnow = zpdtnow.getDate();
if (_this.dload.includes(',' + zpnam + '(d=')) {
zpblack = _this.dload.split(',' + zpnam + '(d=')[1].split('),')[0];
if (!_this.dsave.includes(',' + zpnam + '(d=' + zpblack + '),')) {
_this.dsave = _this.dsave + zpnam + '(d=' + zpblack + '),';
}
}
if (!_this.getConfig('check_all', false)) {
if (_this.dload.includes(',' + zpnam + '(z=')) {
let zpdga = parseInt(_this.dload.split(',' + zpnam + '(z=')[1].split('),')[0]);
if (zpdnow === zpdga) {
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdga + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdga + '),';
}
njoin = 3;
}
}
if (zpblack !== '') {
if (
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + zpblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + zpblack.replace('app/', '') + ',') && !GJuser.white.includes(zpblack + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + zpblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + zpblack.replace('app/', '') + ',') && !GJuser.white.includes(zpblack + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + zpblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + zpblack.replace('app/', '') + ',') && !GJuser.white.includes(zpblack + ',') && _this.getConfig('whitelist_nocards', false))
)
{
njoin = 5;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps.includes(',' + zpblack.replace('app/', '') + ',')) {
njoin = 1;
}
if (GJuser.ownapps.includes(',' + zpblack.replace('sub/', '') + ',')) {
njoin = 1;
}
}
if (GJuser.black.includes(zpblack + ',') && _this.getConfig('blacklist_on', false)) {
njoin = 2;
}
}
if (_this.dload.includes(',' + zpnam + '(w),')) {
if (!_this.dsave.includes(',' + zpnam + '(w)')) {
_this.dsave = _this.dsave + zpnam + '(w),';
}
njoin = 4;
}
}
if (_this.getConfig('skip_xbox', false)) {
if (zpnam.includes('-xbox-') || zpnam.includes('-x-box-')) {
njoin = 5;
}
}
if (_this.getConfig('skip_origin', false)) {
if (zpnam.includes('-origin-key')) {
njoin = 5;
}
}
if (_this.getConfig('skip_epic', false)) {
if (zpnam.includes('-epic-key')) {
njoin = 5;
}
}
if (_this.getConfig('skip_ns', false)) {
if (zpnam.includes('-nintendo-switch-key')) {
njoin = 5;
}
}
let zplog = _this.logLink(zplink, zpnam.replace(/-/g, ' ')),
zplg = '|' + (zpcrr + 1) + '№|  ';
if (zpblack !== '') {
if (GJuser.skip_dlc.includes(',' + zpblack.replace('app/', '') + ',')) {
zplog = '⊟ ' + zplog;
}
else if (GJuser.dlc.includes(',' + zpblack.replace('app/', '') + ',')) {
zplog = '⊞ ' + zplog;
}
if (GJuser.card.includes(',' + zpblack.replace('app/', '') + ',')) {
zplog = '♦ ' + zplog;
}
zpblack = _this.logWhite(zpblack) + _this.logBlack(zpblack);
}
if (_this.getConfig('log', true)) {
zplog = zplg + zplog;
}
if (njoin > 0) {
_this.log(Lang.get('service.checking') + zplog + zpblack, 'chk');
switch (njoin) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 3:
_this.log(Lang.get('service.time') + ', ' + Lang.get('service.data_have'), 'cant');
break;
case 4:
_this.log(Lang.get('service.won_skip') + ', ' + Lang.get('service.data_have'), 'jnd');
break;
case 5:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
}
if (njoin === 0) {
let html = 'err';
rq({
method: 'GET',
url: zplink,
headers: {
'authority': 'www.zeepond.com',
'user-agent': _this.ua,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'referer': _this.url + '/zeepond/giveaways/enter-a-competition',
'cookie': _this.cookies
},
responseType: 'document'
})
.then((htmls) => {
html = htmls.data;
html = html.replace(/<img/gi, '<noload');
})
.finally(() => {
if (html === 'err') {
zpnext = 59000;
_this.log(Lang.get('service.checking') + zplog + zpblack, 'chk');
if (zparray.filter(i => i === zpcrr).length === 1) {
zparray.push(zpcrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else if (html.indexOf('profile-pic') < 0) {
_this.totalTicks = 1;
_this.stimer = 1;
_this.skip = true;
_this.log(Lang.get('service.ses_not_found') + ',' + Lang.get('service.connection_lost').split(',')[1].replace('0', ''), 'err');
}
else {
let won = html.indexOf('You have already won a prize in this competition') >= 0,
entered = html.indexOf('You have already entered today') >= 0,
enter = html.indexOf('>Enter this competition<') >= 0,
zpname = zpnam.replace(/-/g, ' '),
zpsteam = '';
if (enter || entered || won) {
zpname = $(html).find('.mycompetition .form-group .span8 > h1').text().trim();
zpsteam = html.substring(html.indexOf('href="https://store.steam')+6, html.indexOf('</a></p>')).slice(0, 55);
}
let zpown = 0,
zpapp = 0,
zpsub = 0,
zpbun = 0,
zpid = '';
if (!zpsteam.includes('https://store.steam')) {
zpsteam = undefined;
}
if (!enter) {
zpown = 3;
if (!entered && !won) {
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdnow + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnow + '),';
}
}
}
if (entered) {
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdnow + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnow + '),';
}
zpown = 5;
if (_this.getConfig('skip_after', true)) {
_this.skip = true;
}
}
if (zpsteam !== undefined) {
if (zpsteam.includes('app/')) {
zpapp = parseInt(zpsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'app/' + zpapp;
}
else if (zpsteam.includes('sub/')) {
zpsub = parseInt(zpsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'sub/' + zpsub;
}
else if (zpsteam.includes('bundle/')) {
zpbun = parseInt(zpsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'bundle/' + zpbun;
}
if (!_this.dsave.includes(',' + zpnam + '(d=') && zpid !== '') {
_this.dsave = _this.dsave + zpnam + '(d=' + zpid + '),';
}
else if (zpid === '') {
zpid = '???';
}
if (
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + zpapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + zpapp + ',') && !GJuser.white.includes(zpid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + zpapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + zpapp + ',') && !GJuser.white.includes(zpid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + zpapp + ',') && !_this.getConfig('whitelist_nocards', false) && zpid !== '???') ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + zpapp + ',') && !GJuser.white.includes(zpid + ',') && _this.getConfig('whitelist_nocards', false) && zpid !== '???')
)
{
zpown = 7;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
zpown = 2;
}
if (GJuser.ownapps.includes(',' + zpapp + ',') && zpapp > 0) {
zpown = 1;
}
if (GJuser.ownsubs.includes(',' + zpsub + ',') && zpsub > 0) {
zpown = 1;
}
}
if (GJuser.black.includes(zpid + ',') && _this.getConfig('blacklist_on', false)) {
zpown = 4;
}
}
if (won) {
zpown = 6;
if (!_this.dsave.includes(',' + zpnam + '(w),')) {
_this.dsave = _this.dsave + zpnam + '(w),';
}
}
zplog = _this.logLink(zplink, zpname);
if (zpid !== '') {
if (GJuser.skip_dlc.includes(',' + zpapp + ',')) {
zplog = '⊟ ' + zplog;
}
else if (GJuser.dlc.includes(',' + zpapp + ',')) {
zplog = '⊞ ' + zplog;
}
if (GJuser.card.includes(',' + zpapp + ',')) {
zplog = '♦ ' + zplog;
}
zpid = _this.logWhite(zpid) + _this.logBlack(zpid);
}
if (_this.getConfig('log', true)) {
zplog = zplg + zplog;
}
else {
zplog = zplog + zpid;
}
_this.log(Lang.get('service.checking') + zplog + zpid, 'chk');
switch (zpown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 6:
_this.log(Lang.get('service.won_skip'), 'jnd');
break;
case 7:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
if (zpown === 0) {
let resp = 'err';
rq({
method: 'GET',
url: zplink + '/enter_competition',
headers: {
'authority': 'www.zeepond.com',
'user-agent': _this.ua,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'referer': zplink,
'cookie': _this.cookies
},
responseType: 'document'
})
.then(() => {
resp = 'ok';
})
.finally(() => {
if (resp === 'err') {
zpnext = 59000;
if (zparray.filter(i => i === zpcrr).length === 1) {
zparray.push(zpcrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let zpdtnew = new Date();
zpdtnew.setDate(zpdtnew.getUTCDate());
zpdtnew.setHours(zpdtnew.getUTCHours() + 10 + _this.month);
let zpdnew = ('0' + zpdtnew.getDate().toString()).slice(-2);
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnew + '),';
_this.log(Lang.get('service.entered_in') + zplog, 'enter');
}
});
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
});
}
}
