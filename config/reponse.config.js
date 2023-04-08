export const ResponsePresenter=(data,err)=>{
    return {
        result: data,
        meta: err,
    }
}