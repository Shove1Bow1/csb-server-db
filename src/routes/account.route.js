const { router } =require('../../config/express-custom.config');
const { responsePresenter } = require('../../config/reponse.config');
const { checkAccount, checkNameAccount } = require('../services/account.service');

router.post('/admin',[checkNameAccount,checkAccount],(req,res)=>{
    res.send(responsePresenter(
        {token: req.jwtToken}
    ));
})