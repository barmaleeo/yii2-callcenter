export function cDate(str){
    if(typeof str === 'string'){
        return new Date(str.replace(/-/g ,'/'));
    }else{
        return "---";
    }
}

export function sd(date, options = {}){
    if(isNaN(date)){
        return "---"
    }
    var now= new Date();
    switch(Math.round(now/86400000-date/86400000)) {
        case 2:
            var out = 'позавчера';
            break;
        case 1:
            out = 'вчера';
            break;
        case 0:
            out = 'сегодня';
            break;
        case -1:
            out = 'завтра';
            break;
        case -2:
            out = 'послезавтра';
            break;
        default:
            out = dd(date, options)
    }

    return out.indexOf('NaN')>=0?'---':out;

}

export function dd(date, options){
    let out;
    if(options && options.smooth){
        out = dateMonths(date, options.lang);
        if(options.year){
            out += ' ' + date.getFullYear();
        }
    }else if(options && options.optimal) {
        const now = new Date();
        if(now.getFullYear() != date.getFullYear()) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            out = (day > 9 ? day : ('0' + day)) + '-' + (month > 9 ? month : ('0' + month)) + '-' + date.getFullYear() +' г';
        }else{
            out = dateMonths(date, options.lang);
        }

    }else {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        out = (day > 9 ? day : ('0' + day)) + '-' + (month > 9 ? month : ('0' + month)) + '-' + date.getFullYear();
    }
    let div;
    if(options && options.divider){
        div = options.divider;
    }else{
        div  = '-';
    }
    if(options && options.time){
        const hours = date.getHours();
        const mins = date.getMinutes();
        out += ' '+(hours>9?hours:('0'+hours))+':'+(mins>9?mins:('0'+mins));
    }
    return out;
}

export function sds(date){
    if(isNaN(date)){return "---"}
    var day = date.getDate();
    var month = date.getMonth() + 1;
    return (day > 9 ? day : ('0' + day)) + div + (month > 9 ? month : ('0' + month)) + div + date.getFullYear();
}
export function st(date){
    if(isNaN(date)){return date}
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return (hours>9?hours:('0'+hours)) +':'+(minutes>9?minutes:('0'+minutes))
}
export function sdt(date){
    if(isNaN(date)){
        return "---"
    }
    var now= new Date();
    switch(Math.round(now/86400000-date/86400000)) {
        case 2:
            var out = 'позавчера';
            break;
        case 1:
            out = 'вчера';
            break;
        case 0:
            out = 'сегодня';
            break;
        case -1:
            out = 'завтра';
            break;
        case -2:
            out = 'послезавтра';
            break;
        default:
            var day = date.getDate();
            var month = date.getMonth()+1;
            out = (day>9?day:('0'+day)) + '-'+(month>9?month:('0'+month)) +'-'+date.getFullYear();
            break;
    }

    return out+' '+st(date);

}

// Delivery interval
export function di(from, to){
    return sdt(from) + ' - ' + st(to);
}

export function mysqld(date){
    var day = date.getDate();
    var month = date.getMonth()+1;
    return date.getFullYear() + '-' + (month>9?month:('0'+month)) + '-' + (day>9?day:('0' + day));

}
function dateMonths(date, lang){
    if(isNaN(date)){
        return "---"
    }
    if(!lang){
        lang = 2;
    }
    return date.getDate() + ' '+ months[lang][date.getMonth()];
}

let months = {
    1:['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    2:['января', 'февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    3:['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада', 'грудня'],
};

