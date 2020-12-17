export const doesExist = (model, id)=>{
    return new Promise ((resolve,reject)=>{
        model.findById(id, (err,doc)=>{
            if(err || !doc){
                reject(false);
            }
            resolve(true);
        })
    })
}