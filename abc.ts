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
          { "action": "MODIFY_SCORES.SUBMIT", "requestor": "John Doe", "createTs": "2022-05-04T21:28:31.725Z", "ttl": "1683256627", "sk": "REQ#814", "pk": "BAT#814", "srcInput": "{\"bulkRequest\":{\"requestKeys\":{\"action\":\"MODIFY_SCORES\",\"mode\":\"BATCH\",\"reason\":\"Insert Scores\",\"notify\":\"N\",\"customer\":\"Mary Popin\",\"requestor\":\"John Doe\",\"requestDt\":\"4/1/2021\"},\"dbKeys\":null,\"actionData\":null},\"scores\":{\"regId\":\"101\",\"scoresAction\":\"MODIFY_SCORES\",\"stage\":\"SUBMIT\",\"scoresInfo\":{\"oldScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}],\"newScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}]}}}", "campaignId": "NO" },
          { "action": "MODIFY_SCORES.SUBMIT", "requestor": "John Doe", "createTs": "2022-05-04T21:28:31.725Z", "ttl": "1683256627", "sk": "REQ#815", "pk": "BAT#815", "srcInput": "{\"bulkRequest\":{\"requestKeys\":{\"action\":\"MODIFY_SCORES\",\"mode\":\"BATCH\",\"reason\":\"Insert Scores\",\"notify\":\"N\",\"customer\":\"Mary Popin\",\"requestor\":\"John Doe\",\"requestDt\":\"4/1/2021\"},\"dbKeys\":null,\"actionData\":null},\"scores\":{\"regId\":\"102\",\"scoresAction\":\"MODIFY_SCORES\",\"stage\":\"SUBMIT\",\"scoresInfo\":{\"oldScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}],\"newScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}]}}}", "campaignId": "NO" }
        ]



    it("Test 1: true=true", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
      let resp;
      try {
        resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
      }
      catch (e) {
        console.log("error", e);
      }
      stub.restore();
    });

    it("Test 2.3 :tests for isValid (!(event.scores.stage == \"APPROVE\") )&& (!(event.scores.stage == \"REJECT\"))",
        function () {
          const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
          const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
          const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
          const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
          const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
          let resp;
          try {
            resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
          }
          catch (e) {
            console.log("error", e);
          }
          stub.restore();
        });

    it("Test 3:tests for processModifyScoresApproveRejectRequest !getItemResFromDB)", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", null);
      let resp;
      try {
        resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
      }
      catch (e) {
        console.log("error", e);
      }
      stub.restore();
    });

    it("Test 3.1:tests for processModifyScoresApproveRejectRequest !(getItemResFromDB.action == \"MODIFY_SCORES.SUBMIT\"))",
        function () {
          const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
          const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
          const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
          const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
          getItemResFromDB[0].requestor = "mary";
          getItemResFromDB[0].action ="MODIFY_SCORES.APPROVE";
          const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
          const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
          const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
          const sqsHelper = new SqsHelper(new SQS(), "arn:aws:sns:us-east-1:586036623065:nonprod-domainbus-topic", false);
          const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
          getItemResFromDB[0].requestor = "mary";
          const queryByActionStub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
      AWSMock.setSDKInstance(AWS);
      const sendMessageStub = ImportMock.mockFunction(sqsHelper, 'sendMessage', (params, callback) => {
        console.log(`In SQS sendMessage mock`);
        callback(undefined, { MessageId: 'xxxx' });
      });
          let resp;
          try {
            resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
          }
          catch (e) {
            console.log("error", e);
          }
      sendMessageStub.restore();
          queryByActionStub.restore();
        });
    it("Test 3.3:tests for processModifyScoresApproveRejectRequest ",
        function () {
          const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
          const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
          const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
          const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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
          getItemResFromDB[0].action ="MODIFY_SCORES.APPROVE";
          const queryByActionStub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
          let resp;
          try {
            resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
          }
          catch (e) {
            console.log("error", e);
          }
          queryByActionStub.restore();
        });
    it("Test 4:tests for event is null", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {};
      const queryByActionStub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
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

      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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
    it("Test 5.1:tests for getItemResFromDB[0].requestor == event.bulkRequest.requestKeys.requestor", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {
        "bulkRequest": {
          "requestKeys": {
            "action": "MODIFY_SCORES",
            "mode": "BATCH",
            "reason": "Insert Scores",
            "notify": "N",
            "customer": "Mary",
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

      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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

    it("Test 5.2:tests for event.scores.stage == \"REJECT\")", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {
        "bulkRequest": {
          "requestKeys": {
            "action": "MODIFY_SCORES",
            "mode": "BATCH",
            "reason": "Insert Scores",
            "notify": "N",
            "customer": "John",
            "requestor": "Mary Popin",
            "requestDt": "4/1/2021"
          },
          "dbKeys": null,
          "actionData": null
        },
        "scores": {
          "regId": "105",
          "regNo": "995",
          "scoresAction": "MODIFY_SCORES",
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
      };

      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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

    it("Test 5.3:tests for event.scores.stage == \"APPROVE\")", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {
        "bulkRequest": {
          "requestKeys": {
            "action": "MODIFY_SCORES",
            "mode": "BATCH",
            "reason": "Insert Scores",
            "notify": "N",
            "customer": "John",
            "requestor": "Mary Popin",
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

      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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

    it("Test 5.4:tests for event.scores.stage == \"APPROVE\")", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {
        "bulkRequest": {
          "requestKeys": {
            "action": "MODIFY_SCORES",
            "mode": "BATCH",
            "reason": "Insert Scores",
            "notify": "N",
            "customer": "John",
            "requestor": "Mary Popin",
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

      const stub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
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

    it("Test 5.5:tests for event.scores.stage == \"APPROVE\")", function () {
      const bulkRegActionDao = new BulkRegActionDao(new DynamoDB(), "dev-msta-bulk-reg-action", false);
      const bulkBatchHdlr = new BulkModifyScores("dev-msta-bulk-reg-action", false);
      const sqsHelper =    new SqsHelper(new (AWS.SQS),"SCORES_INPUT_QUEUE_URL",false);
      const bulkModifyScoresApproveRejectRequestService: IBulkModifyScoresApproveRejectRequestService = new BulkModifyScoresApproveRejectRequestService(bulkRegActionDao, bulkBatchHdlr, sqsHelper, true);
      const event1:any = {
        "bulkRequest": {
          "requestKeys": {
            "action": "MODIFY_SCORES",
            "mode": "BATCH",
            "reason": "Insert Scores",
            "notify": "N",
            "customer": "John",
            "requestor": "Mary Popin",
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
      const getItemResFromDBCatch = {
          "pk": "BAT#824",
          "sk": "REQ#824",
          "action": "MODIFY_SCORES.SUBMIT",
          "campaignId": "NO",
          "createTs": "2022-05-06T20:53:18.322Z",
          "requestor": "John Doe",
          "scoresRegNo": "993",
          "srcInput": "{\"bulkRequest\":{\"requestKeys\":{\"action\":\"MODIFY_SCORES\",\"mode\":\"BATCH\",\"reason\":\"Insert Scores\",\"notify\":\"N\",\"customer\":\"Mary Popin\",\"requestor\":\"John Doe\",\"requestDt\":\"4/1/2021\"},\"dbKeys\":null,\"actionData\":null},\"scores\":{\"regId\":\"103\",\"regNo\":\"993\",\"scoresAction\":\"MODIFY_SCORES\",\"stage\":\"SUBMIT\",\"scoresInfo\":{\"oldScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}],\"newScores\":[{\"scoreTierCd\":74,\"rawScores\":6,\"scaledScores\":14},{\"scoreTierCd\":72,\"rawScores\":9,\"scaledScores\":13}]}}}",
          "ttl": 1683427314
      }
      const queryByActionStub = ImportMock.mockFunction(bulkRegActionDao, "queryByAction", getItemResFromDB);
      const errorNSStub = ImportMock.mockFunction(errorNotificationService, "publishErrorNotification", { "status": "success" });
      //const sendMessageStub = ImportMock.mockFunction(sqsHelper,"sendMessage",{ "status": "success" });
      let resp;
      try {
        resp =  bulkModifyScoresApproveRejectRequestService.processModifyScoresApproveRejectRequest(event1);
      }
      catch (e) {
        console.log("error", e);
      }
      //sendMessageStub.restore();
      queryByActionStub.restore();
      errorNSStub.restore();
    });

  });
})
