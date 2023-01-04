const userDepartmentService = require('../service/userDepartmentService');
const {validateString} = require("../utils/validateString");

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

class userDepartmentController {

    async addDepartmentCallback(req, res) {
        const department_name = validateString(req.body.department_name).legalStr
        const result = await userDepartmentService.addDepartment(department_name);
        setStatusCode(res, result);
        res.json(result);
    }

    async deleteDepartmentCallback(req, res) {
        const {
            department_id
        } = req.body;
        const result = await userDepartmentService.deleteDepartment(department_id);
        setStatusCode(res, result);
        res.json(result);
    }

    async updateDepartmentCallback(req, res) {
        const department_id = validateString(req.body.department_id).legalStr
        const department_name = validateString(req.body.department_name).legalStr
        const result = await userDepartmentService.updateDepartment(department_id, department_name);
        setStatusCode(res, result);
        res.json(result);
    }

    async listAllDepartmentCallback(req, res) {
        const result = await userDepartmentService.listAllDepartment();
        setStatusCode(res, result);
        res.json(result);
    }

    async searchDepartmentCallback(req, res) {
        const {
            searchValue
        } = req.body;
        const result = await userDepartmentService.searchDepartment(searchValue);
        setStatusCode(res, result);
        res.json(result);
    }

    async deletePeopleDepartmentCallback(req, res) {
        const {account} = req.body;
        const result = await userDepartmentService.deletePeopleDepartment(account);
        setStatusCode(res, result);
        res.json(result);
    }
}

module.exports = new userDepartmentController();
