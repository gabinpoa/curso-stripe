import "dotenv/config";
import { sendMagicLink } from "./send-magic-link";
import * as emailModule from "../email/send";

const requiredEnv = [
  "RUN_EMAIL_INTEGRATION_TESTS",
  "SEND_TO_EMAIL",
  "BASE_URL",
  "AUTH_SECRET",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "EMAIL_SOURCE",
];

const hasRequiredEnv = requiredEnv.every(
  (key) => process.env[key] && process.env[key] !== ""
);

const describeIf = hasRequiredEnv ? describe : describe.skip;

describeIf("sendMagicLink (integration)", () => {
  it("sends a real email via SES", async () => {
    const sendEmailSpy = jest.spyOn(emailModule, "sendEmail");

    await sendMagicLink(process.env.SEND_TO_EMAIL!, "integration-test-user");

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);

    const sendResult = await sendEmailSpy.mock.results[0].value;
    expect(sendResult).toBe(true);
  }, 60_000);
});
