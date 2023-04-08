const responsePresenter=(data,err)=>{
    return {
        result: data,
        meta: err,
    }
}
module.exports={
    responsePresenter
}