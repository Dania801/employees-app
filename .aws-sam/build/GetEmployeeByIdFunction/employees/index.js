const _ = require('lodash');
const AWS = require('aws-sdk');
const moment = require('moment');
const uuid = require('node-uuid');

AWS.config.update({ region: process.env.REGION, apiVersion: '2012-08-10' });

const docClient = new AWS.DynamoDB.DocumentClient();

const getEmployees = async () => {
  const { Items } = await docClient.scan({
    TableName: 'Employees'
  }).promise();
  return Items;
};

const getEmployeeById = async (id) => {
  const { Item } = await docClient.get({
    TableName: 'Employees',
    Key: { id }
  }).promise();
  return Item;
};

const createEmployee = async (employeeName, joiningDate, department, salary) => {
  const Item = {
    employeeName, joiningDate, department, salary,
    createdAt: moment().unix(),
    updatedAt: moment().unix(),
    id: uuid()
  }
  await docClient.put({
    TableName: 'Employees',
    Item
  }).promise();
  return Item;
};

const deleteEmployee = async (id) => {
  const response = await docClient.delete({
    TableName: 'Employees',
    Key: { id }
  }).promise();
  return response;
};

const updateEmployee = async (id, { employeeName, joiningDate, department, salary }) => {
  let UpdateExpression = 'set updatedAt = :updatedAt';
  const ExpressionAttributeValues = {
    ':updatedAt': moment().unix()
  };
  if (employeeName) {
    UpdateExpression += ', employeeName = :employeeName';
    ExpressionAttributeValues[':employeeName'] = employeeName;
  }
  if (joiningDate) {
    UpdateExpression += ', joiningDate = :joiningDate';
    ExpressionAttributeValues[':joiningDate'] = joiningDate;
  }
  if (department) {
    UpdateExpression += ', department = :department';
    ExpressionAttributeValues[':department'] = department;
  }
  if (salary) {
    UpdateExpression += ', salary = :salary';
    ExpressionAttributeValues[':salary'] = salary;
  }
  const response = await docClient.update({
    TableName: 'Employees',
    Key: { id },
    UpdateExpression,
    ExpressionAttributeValues,
  }).promise();
  return response;
};

const queryEmployees = async (fieldName, fieldValue) => {
  const KeyConditionExpression = `${fieldName} = :${fieldName}`;
  const ExpressionAttributeValues = {};
  ExpressionAttributeValues[`:${fieldName}`] = fieldValue;
  const data = await docClient.query({
    IndexName: `${fieldName}-index`,
    TableName: 'Employees',
    ExpressionAttributeValues,
    KeyConditionExpression
  }).promise();
  return data;
}

const searchEmployees = async ({ employeeName, department }) => {
  if (employeeName && !department) {
    return queryEmployees('employeeName', employeeName);
  }
  else if (department && !employeeName) {
    return queryEmployees('department', department);
  }
  else if (department && employeeName) {
    const { Items: nameResult} = await queryEmployees('employeeName', employeeName);
    const { Items: departmentResult } = await queryEmployees('department', department);
    return _.uniqBy(nameResult.concat(departmentResult), 'id');
  }
  else {
    return getEmployees();
  }
}

module.exports = {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  getEmployeeById,
  searchEmployees
};