const { router } = require('../../config/express-custom.config');
const { responsePresenter } = require('../../config/reponse.config');
const { checkAccount } = require('../services/account.service');
const { validateInputAccount } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { AccountSchema } = require('../entities/account.entity');

router.post('/login', [validateInputAccount], async (req, res) => {
    try {
        const {name,password}=req.body;
        console.log(req.body)
        const account = await checkAccount(name,password)
        return res.send(responsePresenter(
            { token: account }
        ));
    }
    catch (error) {
        // logError(error, '/admin/login')
        console.log(error)
        res.send(error);
    }
})

module.exports = router;