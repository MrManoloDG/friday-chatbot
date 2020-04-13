
exports.check_date = function(fields){
    let check = false;
    for(let index in fields){
        if (fields[index].type == 'date'){
            check = true;
        }
    }
    return check;
}