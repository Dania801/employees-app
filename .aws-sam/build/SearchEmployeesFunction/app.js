const { getEmployees, getEmployeeById, createEmployee, deleteEmployee, updateEmployee, searchEmployees } = require('./employees');
const { generateResponse, generateError } = require('./utils');
const Joi = require('@hapi/joi');

exports.getEmployees = async () => {
	try {
		const employees = await getEmployees();
		return generateResponse({ data: employees }, { statusCode: 200 });
	} catch (err) {
		return generateError(err, { statusCode: 500 });
	}
};

exports.getEmployeeById = async (event) => {
	try {
		const { id } = event.pathParameters;
		const employee = await getEmployeeById(id);
		return generateResponse({ data: employee }, { statusCode: 200 });
	} catch (err) {
		return generateError(err, { statusCode: 500 });
	}
};

exports.updateEmployee = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const { id } = event.pathParameters;
		const schema = Joi.object().keys({
			employeeName: Joi.string().min(3).max(50),
			joiningDate: Joi.date().greater(new Date()),
			department: Joi.string().valid('HR', 'Marketing', 'IT'),
			salary: Joi
				.when('department', { is: 'HR', then: Joi.number().greater(2500).less(15000) })
				.when('department', { is: 'IT', then: Joi.number().greater(3000).less(20000) })
		});
		const validation = schema.validate(body);
		if (validation.error) {
			return generateError(validation.error);
		}
		await updateEmployee(id, { ...body });
		return generateResponse({ success: true }, { statusCode: 200 });
	} catch (err) {
		return generateError(err);
	}
};

exports.deleteEmployee = async (event) => {
	try {
		const { id } = event.pathParameters;
		await deleteEmployee(id);
		return generateResponse({ success: true }, { statusCode: 200 });
	} catch (err) {
		return generateError(err);
	}
};

exports.createEmployee = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const schema = Joi.object().keys({
			employeeName: Joi.string().required().min(3).max(50),
			joiningDate: Joi.date().required().greater(new Date()),
			department: Joi.string().required().valid('HR', 'Marketing', 'IT'),
			salary: Joi.required()
				.when('department', { is: 'HR', then: Joi.number().greater(2500).less(15000) })
				.when('department', { is: 'IT', then: Joi.number().greater(3000).less(20000) })
		});
		const validation = schema.validate(body);
		if (validation.error) {
			return generateError(validation.error);
		}
		const { employeeName, joiningDate, department, salary } = body;
		const item = await createEmployee(employeeName, joiningDate, department, salary);
		return generateResponse(item, { statusCode: 201 });
	} catch (err) {
		return generateError(err);
	}
};

exports.searchEmployees = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const { employeeName, department } = body;
		const data = await searchEmployees({ employeeName, department });
		return generateResponse(data, { statusCode: 201 });
	} catch (err) {
		return generateError(err);
	}
};