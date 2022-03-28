import sinon from 'sinon';
import authController from '../../../src/contollers/auth.controller.js';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import db from '../../../src/config/database.js';
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

    it('return status 400 if one of required fields not passed in',async () =>{
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
    it('return status 409 if email already in use',async () =>{
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
    it('return status 409 username already in use',async () =>{
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
        const dbQueryStub = sandbox.stub(db,'query')
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[{ some: 'object' }]});

        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('username is already exist');
        expect(dbQueryStub).to.be.calledTwice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(409);
    });
    it('return status 400 if something get wrong during call',async () =>{
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
        const dbQueryStub = sandbox.stub(db,'query')
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[]});
        dbQueryStub.onCall(2).throws({detail: 'problems...'})

        const result = await authController.registerUser(req,res);

        expect(result.error).to.be.equal('error happens');
        expect(dbQueryStub).to.be.calledThrice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(400);
    });
    it('create user and return 201',async () =>{
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
        }

        const sendStub = sandbox.stub().resolves(userResponse);
        const statusStub = sandbox.stub().returns;

        res = {
            send: sendStub,
            status: statusStub,
        };
        const dbQueryStub = sandbox.stub(db,'query')
        dbQueryStub.onCall(0).resolves({rows:[]});
        dbQueryStub.onCall(1).resolves({rows:[]});
        dbQueryStub.onCall(2).resolves({rows:[{id:1}]})

        const result = await authController.registerUser(req,res);

        expect(result).to.eql({
                userId: 12,
                username: 'xx',
                email: 'email123',
                token: '1/token',
                password: 'encryptedPassword',
                userRole: 1
            }
        )
        expect(result.error).to.be.undefined;
        expect(dbQueryStub).to.be.calledThrice;
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(201);
    });
});