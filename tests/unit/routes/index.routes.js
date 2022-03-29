import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
import router, {rootHandler} from '../../../src/routes/index.js';

describe('test root route', ()=>{
    it('should test root route',()=>{
        const routes = [
            { path: '/api', method: 'get' },
        ];
        routes.forEach((route) => {
            const match = router.stack.find(
                (s) => s.route.path === route.path && s.route.methods[route.method]
            );
            expect(match).not.be.undefined;
        });
    });
});

describe('test auth routes',()=>{
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('should test root handler',async()=>{
        const sendStub = sandbox.stub().resolves({message: 'ok'});
        const statusStub = sandbox.stub().returns;

        const res = {
            send: sendStub,
            status: statusStub,
        };
        const req = {};
        const response  = await rootHandler(req,res);
        expect(response).to.be.eql({message: 'ok'});
        expect(sendStub).to.be.calledOnce;
        expect(res.defaultBehavior.returnValue).to.be.equal(200);
    });
});

