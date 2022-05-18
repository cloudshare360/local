
"use strict";

import * as assert from "assert";
import { ISqsHelper, SqsHelper } from "../../../src/core/dal/sqs-helper";
import { SQS } from "aws-sdk";
import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";;



describe("Unit Tests for the sqs-helper ", function () {

    describe("tests for sqs-helper", function () {

        it("Test 1: true=true", function () {
            const right = true;
            assert.deepStrictEqual(right, true);
        });

        it("Test 2: testing SqsHelper sqs sendMessage -sending message error", async () => {
            const params: any = {
                "action": "SUBMIT",
                "requestKeys": "REQ#1001",
                "regId": "123"
            }
            let err:any = "Error";
            AWSMock.setSDKInstance(AWS);
            AWSMock.mock('SQS', 'sendMessage',(params, callback) => {
                console.log(`In SQS sendMessage mock`);
                callback(err, undefined);
            });
            const sqsHelper = new SqsHelper(new SQS(), "arn:aws:sns:us-east-1:586036623065:nonprod-domainbus-topic", false);
            let resp: any;

            try {

                resp = await sqsHelper.sendMessage(JSON.stringify(params));
            } catch (error) {
                err = error;
            }
            AWSMock.restore();
            console.log("resp = " + JSON.stringify(resp));
            //assert.notDeepEqual(err, null);
        });

        it("Test 2.1: testing SqsHelper sqs sendMessage -sending message successfully", async () => {
            const params: any = {
                "action": "MAKEUP",
                "requestKeys": "REQ#1001",
                "regId": "123"
            }

            AWSMock.setSDKInstance(AWS);
            AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
                console.log(`In SQS sendMessage mock`);
                callback(undefined, { MessageId: 'xxxx' });
            });
            const sqsHelper = new SqsHelper(new SQS(), "https://sqs.us-east-1.amazonaws.com/586036623065/dev-ta-core-infra-error-notification-queue", false);
            const resp: any = await sqsHelper.sendMessage(JSON.stringify(params));
            console.log(`sqs resp is: ${JSON.stringify(resp, null, 2)}`);
            AWSMock.restore();
            assert.deepStrictEqual(resp.MessageId, 'xxxx');
        });


        it("Test 3: testing SqsHelper sqs recieveMsg -receiving message successfully", async () => {
            const params: any = {};
            const data : any = "receiveMessage"
            AWSMock.setSDKInstance(AWS);
            AWSMock.mock('SQS', 'receiveMessage',(params, callback) => {
                console.log(`In SQS receiveMessage mock`);
                callback(undefined, data);
            });
            const sqsHelper = new SqsHelper(new SQS(), "arn:aws:sns:us-east-1:586036623065:nonprod-domainbus-topic", false);
            let resp: any;
            let err;
            try {

                resp = await sqsHelper.recieveMsg(JSON.stringify(params));
            } catch (error) {
                err = error;
            }
            AWSMock.restore();
            console.log("resp = " + JSON.stringify(resp));
            //assert.notDeepEqual(err, null);
        });

        it("Test 3.1: testing SqsHelper sqs recieveMsg -receiving message :error", async () => {
            const params: any = {
                "action": "HOLDS",
                "requestKeys": "REQ#1001",
                "regId": "123"
            }
            AWSMock.setSDKInstance(AWS);
            AWSMock.mock('SQS', 'receiveMessage',(params, callback) => {
                console.log(`In SQS receiveMessage mock`);
                callback(err, undefined);
            });
            const sqsHelper = new SqsHelper(new SQS(), "arn:aws:sns:us-east-1:586036623065:nonprod-domainbus-topic", false);
            let resp: any;
            let err;
            try {

                resp = await sqsHelper.recieveMsg(JSON.stringify(params));
            } catch (error) {
                err = error;
            }
            AWSMock.restore();
            console.log("resp = " + JSON.stringify(resp));
            //assert.notDeepEqual(err, null);
        });

    })

});
