
// This utility function check if there is some type date fields in the array of fields
exports.check_date = function(fields){
    return new Promise((resolve,reject) => {
        let check = false;
        for(let index in fields){
            if (fields[index].type == 'date' && index !== '@timestamp'){
                check = true;
            }
        }
        resolve(check);
    });
}

// This utility function check if there are more than one value set
exports.check_length_many = function(fields){
    return new Promise((resolve,reject) => {
        delete fields['@timestamp'];
        let check = Object.keys(fields).length;
        resolve((check > 1));
    });
}

exports.getFields = function(fields) {
    let fields_columns = [];
    for(let index in fields){
        if (index !== '@timestamp'){
            fields_columns.push(index);
        }
    }
    return fields_columns;
}

exports.check_date_field = function(fields, timeField){
    return new Promise((resolve,reject) => {
        resolve((fields[timeField] !== undefined && fields[timeField] != null && fields[timeField].type == 'date'));
    });
}

exports.check_field = function(fields, field) {
    return new Promise((resolve,reject) => {
        resolve((fields[field] !== undefined && fields[field] != null));
    });
}