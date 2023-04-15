function responseMeta(message, status, err){
    const meta={  
        status: status?status:200,
        message: message?message:'success',
        error: err?err:'hello123',
    }
    return{
        meta
    }
}
module.exports={
    responseMeta
}