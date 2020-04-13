
exports.check_date = function(fields){
    return new Promise((resolve,reject) => {
        let check = false;
        for(let index in fields){
            if (fields[index].type == 'date'){
                check = true;
            }
        }
        resolve(check);
    });
}