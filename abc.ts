"use strict";

import * as assert from "assert";
import { BulkRegActionDao } from "../../../src/core/dal/bulk-reg-action-dao";
import { ScoresGetPendingRequestsService } from "../../../src/core/service/scores-get-pending-requests-service";
import { ImportMock } from "ts-mock-imports";
import * as AWS from "aws-sdk";
import {DynamoDB, SQS} from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import * as errorNotificationService from "tacommon/handler-wrappers/publishErrorNotification";
import {
    BulkModifyScoresApproveRejectRequestService,
    IBulkModifyScoresApproveRejectRequestService
} from "../../../src/core/service/bulk-modify-scores-approve-reject-request-service";
import { BulkModifyScores } from "msta-bulk-base/bulk/bulk-modify-scores";
import {ISqsHelper, SqsHelper} from "../../../src/core/dal/sqs-helper";
import {EnvHelper} from "tacommon/util/env-helper";
import {EnvKey} from "../../../src/env-key";      import * as publishErrorNotificationService from "tacommon/handler-wrappers/publishErrorNotification";
import {throws} from "assert";
AWS.config.region = 'us-east-1';

describe("Unit Tests for the Bulk Modify Scores submit request Service", function () {

    describe("tests for Bulk Modify Scores submit request Service", function () {
        const eventInp = {"regNo": "9999"};
        const eventInp1 = {"regNo": "11111"};
        const eventInp2 = {"regNo": ""};
        const getItemResFromDB =
            [
                {
                    "action": "MODIFY_SCORES.SUBMIT",
                    "requestor": "John Doe",
                    "createTs": "2022-05-04T21:28:31.725Z",
                    "ttl": "1683256627",
                    "sk": "REQ#814",
                    "pk": "BAT#814",
                    "srcInput": "{\"bulkRequest\":{\"requestKeys\":{\"action\":\"MODIFY_SCORES\",\"mode\":\"BATCH\",\"reason\":\"Insert Scores\",\"notify\":\"N\",\"customer\":\"Mary Popin\",\"requestor\":\"John Doe\",\"requestDt\":\"4/1/2021\"},\"dbKeys\":null,\"actionData\":null},\"scores\":{\"regId\":\"101\",\"scoresAction\":\"MODIFY_SCORES\",\"stage\":\"SUBMIT\",\"scoresInfo\":{\"oldScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}],\"newScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}]}}}",
                    "campaignId": "NO"
                },
                {
                    "action": "MODIFY_SCORES.SUBMIT",
                    "requestor": "John Doe",
                    "createTs": "2022-05-04T21:28:31.725Z",
                    "ttl": "1683256627",
                    "sk": "REQ#815",
                    "pk": "BAT#815",
                    "srcInput": "{\"bulkRequest\":{\"requestKeys\":{\"action\":\"MODIFY_SCORES\",\"mode\":\"BATCH\",\"reason\":\"Insert Scores\",\"notify\":\"N\",\"customer\":\"Mary Popin\",\"requestor\":\"John Doe\",\"requestDt\":\"4/1/2021\"},\"dbKeys\":null,\"actionData\":null},\"scores\":{\"regId\":\"102\",\"scoresAction\":\"MODIFY_SCORES\",\"stage\":\"SUBMIT\",\"scoresInfo\":{\"oldScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}],\"newScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}]}}}",
                    "campaignId": "NO"
                }
            ]
        const bulkRegDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
        const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
        const sqsHelper = new SqsHelper(new SQS(), "arn:aws:sns:us-east-1:586036623065:nonprod-domainbus-topic", false);
        const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegDao, bulkBatchHdlr, sqsHelper, true);

        it("Test 1: true=true", function () {
            const event1:any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BATCH",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
        });
        it("Test 1.1: true=true requestKeys is empty", function () {
            const event1:any = {
                "bulkRequest": {
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
        });

        it("Test 2:tests for isValid  requestKeys.action !== \"MODIFY_SCORES\"", function () {
            const event1:any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "INSERT_SCORES",
                        "mode": "BATCH",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
        });

        it("Test 2.1 :tests for isValid requestKeys.mode !== \"BATCH\"", function () {
            const event1:any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BULK",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
        });

        it("Test 2.2 :tests for isValid requestKeys.mode !== \"BATCH\"", function () {
            const event1:any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BATCH",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "SUBMIT",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
        });

        it("Test 2.3 :tests for isValid (!(event.scores.stage == \"APPROVE\") )&& (!(event.scores.stage == \"REJECT\"))", function () {
                const event1:any = {
                    "bulkRequest": {
                        "requestKeys": {
                            "action": "MODIFY_SCORES",
                            "mode": "BATCH",
                            "reason": "Modify or Insert Scores",
                            "notify": "N",
                            "customer": "Mary Popin",
                            "requestor": "John Doe",
                            "requestDt": "4/1/2021"
                        },
                        "dbKeys": null,
                        "actionData": null
                    },
                    "scores": {
                        "regId": "101",
                        "regNo": "22222222",
                        "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                        "stage": "SUBMIT",
                        "scoresInfo": {
                            "oldScores": [
                                {
                                    "scoreTierCd": 74,
                                    "rawScores": 6,
                                    "scaledScores": 14
                                },
                                {
                                    "scoreTierCd": 72,
                                    "rawScores": 9,
                                    "scaledScores": 13
                                }
                            ],
                            "newScores": [
                                {
                                    "scoreTierCd": 74,
                                    "rawScores": 6,
                                    "scaledScores": 14
                                },
                                {
                                    "scoreTierCd": 72,
                                    "rawScores": 9,
                                    "scaledScores": 13
                                }
                            ]
                        }
                    }
                }
                const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
                let resp;
                try {
                    resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
                }
                catch (e) {
                    console.log("error", e);
                }
                stub.restore();
            });

        it("Test 3.2:tests for processModifyScoresApproveRejectRequest event.bulkRequest.requestKeys.action = \"MODIFY_SCORES\"))", function () {
            const event1: any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BATCH",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            getItemResFromDB[0].requestor = "mary";
            const queryByActionStub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            const updateScoresActionStub = ImportMock.mockFunction(bulkRegDao, "updateScoresAction", getItemResFromDB);
            const sendMessageStub = ImportMock.mockFunction(sqsHelper, 'sendMessage', { MessageId: 'xxxx' });
            AWSMock.setSDKInstance(AWS);
            AWSMock.mock(
                "DynamoDB.DocumentClient",
                "update",
                (params: GetItemInput, callback) => {
                    console.log(`In Dynamodb query mock for taGetRegDao`);
                    callback(null, getItemResFromDB);
                }
            );
            AWSMock.mock(
                "SQS",
                "sendMessage",
                {"message":"XXXX"})

            ;
            let resp;
            try {
                resp = bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            } catch (e) {
                console.log("error", e);
            }
            AWSMock.restore();
            sendMessageStub.restore();
            updateScoresActionStub.restore();
            queryByActionStub.restore();
        });

        it("Test 4:tests for event is null", function () {
            const event1:any = {};
            const queryByActionStub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            queryByActionStub.restore();
        });

        it("Test 5:tests for getItemResFromDB exists", function () {
            const event1:any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BATCH",
                        "reason": "Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "105",
                    "regNo": "995",
                    "scoresAction": "MODIFY_SCORES",
                    "stage": "APPROVE",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            };

            const stub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            const errorNSStub = ImportMock.mockFunction(errorNotificationService, "publishErrorNotification", { "status": "success" });
            let resp;
            try {
                resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            }
            catch (e) {
                console.log("error", e);
            }
            stub.restore();
            errorNSStub.restore();
        });

        it("Test 6:tests for processModifyScoresApproveRejectRequest event.bulkRequest.requestKeys.action = \"MODIFY_SCORES\") and  event.scores.stage == \"REJECT\")", function () {
            const event1: any = {
                "bulkRequest": {
                    "requestKeys": {
                        "action": "MODIFY_SCORES",
                        "mode": "BATCH",
                        "reason": "Modify or Insert Scores",
                        "notify": "N",
                        "customer": "Mary Popin",
                        "requestor": "John Doe",
                        "requestDt": "4/1/2021"
                    },
                    "dbKeys": null,
                    "actionData": null
                },
                "scores": {
                    "regId": "101",
                    "regNo": "22222222",
                    "scoresAction": "INSERT_SCORES OR MODIFY_SCORES",
                    "stage": "REJECT",
                    "scoresInfo": {
                        "oldScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ],
                        "newScores": [
                            {
                                "scoreTierCd": 74,
                                "rawScores": 6,
                                "scaledScores": 14
                            },
                            {
                                "scoreTierCd": 72,
                                "rawScores": 9,
                                "scaledScores": 13
                            }
                        ]
                    }
                }
            }
            getItemResFromDB[0].requestor = "mary";
            const queryByActionStub = ImportMock.mockFunction(bulkRegDao, "queryByAction", getItemResFromDB);
            const updateScoresActionStub = ImportMock.mockFunction(bulkRegDao, "updateScoresAction", {
                "Attributes": {
                    "updateTs": "01-01-2021",
                    "holdCode": "holdCode",
                    "regHoldsCreateTs": "01-01-2021",
                    "stagedHoldCodeUpdateTs": "01-01-2021",
                    "cancelScoreTs": "01-01-2021",
                    "cancelScoreHoldTypeCd": "5",
                    "cancelScoreDetails": "null"
                }
            });
            const sendMessageStub = ImportMock.mockFunction(sqsHelper, 'sendMessage', { MessageId: 'xxxx' });
            const expectedRes: any = {
                "Attributes": {
                    "updateTs": "01-01-2021",
                    "holdCode": "holdCode",
                    "regHoldsCreateTs": "01-01-2021",
                    "stagedHoldCodeUpdateTs": "01-01-2021",
                    "cancelScoreTs": "01-01-2021",
                    "cancelScoreHoldTypeCd": "5",
                    "cancelScoreDetails": "null"

                }
            }
            AWSMock.setSDKInstance(AWS);
            AWSMock.mock(
                "DynamoDB.DocumentClient",
                "update",
                (params: GetItemInput, callback) => {
                    console.log(`In Dynamodb query mock for taGetRegDao`);
                    callback(null, expectedRes);
                }
            );
            let resp;
            try {
                resp = bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
            } catch (e) {
                console.log("error", e);
            }
            AWSMock.restore();
            sendMessageStub.restore();
            updateScoresActionStub.restore();
            queryByActionStub.restore();
        });

    });
})
