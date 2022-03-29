import sinon from 'sinon';
import authController from '../../../src/contollers/auth.controller.js';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import db from '../../../src/config/database.js';
import bcrypt from 'bcryptjs';
const expect = chai.expect;
chai.use(sinonChai);

describe('#registerUser',()=>{
    let sandbox;
    let res;
    let req;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 400 if one of required fields not passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'required param not passed'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        req = {
            body:{
                password: 'xx',
                email: 'email'
            }};
        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('required param not passed');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);

    });
    it('should return status 409 if email already in use',async () =>{
        req = {
            body:{
                username: 'xx',
                email: 'email123',
                password: '123'
            }};

        const sendStub = sandbox.stub().resolves({error: 'email is already exist'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[{ some: 'object' }]});

        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('email is already exist');
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(409);

    });
    it('should return status 409 username already in use',async () =>{
        req = {
            body:{
                username: 'xx',
                email: 'email123',
                password: '123'
            }};

        const sendStub = sandbox.stub().resolves({error: 'username is already exist'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query');
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[{ some: 'object' }]});

        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('username is already exist');
        expect(dbQueryStub).to.be.calledTwice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(409);
    });
    it('should return status 400 if something get wrong during call',async () =>{
        req = {
            body:{
                username: 'xx',
                email: 'email123',
                password: '123'
            }};

        const sendStub = sandbox.stub().resolves({error: 'error happens'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query');
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[]});
        dbQueryStub.onCall(2).throws({detail: 'problems...'});

        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('error happens');
        expect(dbQueryStub).to.be.calledThrice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should create user and return 201',async () =>{
        req = {
            body:{
                username: 'xx',
                email: 'email123',
                password: '123'
            }};
        const userResponse = {
            userId: 12,
            username: 'xx',
            email: 'email123',
            token: '1/token',
            password: 'encryptedPassword',
            userRole: 1
        };

        const sendStub = sandbox.stub().resolves(userResponse);
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query');
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[]});
        dbQueryStub.onCall(2).resolves({rows:[{id:1}]});

        const result = await authController.registerUser(req,res);

        expect(result).to.eql({
            userId: 12,
            username: 'xx',
            email: 'email123',
            token: '1/token',
            password: 'encryptedPassword',
            userRole: 1
        }
        );
        expect(result.error).to.be.undefined;
        expect(dbQueryStub).to.be.calledThrice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(201);
    });
});

describe('#login',()=>{
    let sandbox;
    let res;
    let req;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 400 if one of required fields not passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'required param not passed'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        req = {
            body:{
                password: 'xx',
            }};
        const result = await authController.login(req,res);

        expect(result.error).to.be.equal('required param not passed');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 401 wrong credentials',async () =>{
        req = {
            body:{
                username: 'xx',
                password: '123'
            }};

        const sendStub = sandbox.stub().resolves({error: 'invalid credentials'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[{ some: 'object' }]});
        const bcryptStub = sandbox.stub(bcrypt,'compare').resolves(false);

        const result = await authController.login(req,res);

        expect(result.error).to.be.equal('invalid credentials');
        expect(dbQueryStub).to.be.calledOnce;
        expect(bcryptStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(401);

    });
    it('should return status 200 and user object in response if correct credentials',async () =>{
        req = {
            body:{
                username: 'xx',
                password: '123'
            }};

        const sendStub = sandbox.stub().resolves({user: 'me the user'});
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[{ some: 'object' }]});
        const bcryptStub = sandbox.stub(bcrypt,'compare').resolves(true);

        const result = await authController.login(req,res);

        expect(result).to.be.eql({user: 'me the user'});
        expect(dbQueryStub).to.be.calledOnce;
        expect(bcryptStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);

    });
});

describe('#getAllUsers',()=>{
    let sandbox;
    let res;
    let req;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 200 and array of all users',async () =>{
        const sendStub = sandbox.stub().resolves([{user: 'me the user'}]);
        const statusStub = sandbox.stub().returns;
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[{ some: 'object' }]});
        const result = await authController.getAllUsers(req,res);

        expect(result).to.be.an('array');
        expect(result).to.be.eql([{user: 'me the user'}]);
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);
    });
});

describe('#getUserById ',()=>{
    let sandbox;
    let res;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 400 if wrong id passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'wrong param'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 'xx'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.getUserById(req,res);

        expect(result.error).to.be.equal('wrong param');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 404 if user not found',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'user not found'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[]});
        const result = await authController.getUserById(req,res);

        expect(result.error).to.be.equal('user not found');
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(404);
    });
    it('should return status 200 and user by id passed in path',async () =>{
        const sendStub = sandbox.stub().resolves({user: 'me the user'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rows:[{ some: 'object' }]});
        const result = await authController.getUserById(req,res);
        expect(result).to.be.eql({user: 'me the user'});
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);
    });
});

describe('#deleteUser',()=>{
    let sandbox;
    let res;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 400 if wrong id passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'wrong param'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 'xx'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.deleteUser(req,res);

        expect(result.error).to.be.equal('wrong param');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 404 if user not found',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'user not found'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rowCount:0});
        const result = await authController.deleteUser(req,res);

        expect(result.error).to.be.equal('user not found');
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(404);
    });
    it('should return status 200 and delete user by id passed in path',async () =>{
        const sendStub = sandbox.stub().resolves({user: 'me the user'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rowCount:1});
        const result = await authController.deleteUser(req,res);
        expect(result).to.be.eql({user: 'me the user'});
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);
    });
});

describe('#updateUser',()=>{
    let sandbox;
    let res;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should return status 400 if wrong id passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'wrong param'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 'xx'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('wrong param');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 400 if role not passed in',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'role not passed in'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {}
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('role not passed in');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 400 if role is not number',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'number should be passed'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {
                role: 'xx'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('number should be passed');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 400 if role in wrong range',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'wrong range'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {
                role: '25'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('wrong range');
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 404 if user not found',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'user not found'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {
                role: '2'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rowCount:0});
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('user not found');
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(404);
    });
    it('should return status 400 if sql return exception',async () =>{
        const sendStub = sandbox.stub().resolves({error: 'problems...'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {
                role: '2'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').throws({detail: 'problems...'});
        const result = await authController.updateUser(req,res);

        expect(result.error).to.be.equal('problems...');
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('should return status 200 and update user role',async () =>{
        const sendStub = sandbox.stub().resolves({user: 'me the user'});
        const statusStub = sandbox.stub().returns;
        const req = {
            params: {
                id: 12
            },
            body: {
                role: '2'
            }
        };
        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query').resolves({rowCount:1});
        const result = await authController.updateUser(req,res);
        expect(result).to.be.eql({user: 'me the user'});
        expect(dbQueryStub).to.be.calledOnce;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);
    });
});