const { sendEmail } = require("../src/email_sender");
const {
  getRandomQuote,
  validateEmail,
  sendInspiration,
  errorMessages,
} = require("../src/send_inspiration");
const fs = require("fs");
const nodemailer = require("nodemailer");

describe("Inspirational Email Program", () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jasmine
      .createSpy("sendMail")
      .and.callFake(async (mailOptions) => {
        if (!mailOptions.to || !mailOptions.subject || !mailOptions.text) {
          throw new Error(errorMessages.invalidEmailOption);
        }
        return { response: "250 OK" };
      });

    spyOn(nodemailer, "createTransport").and.returnValue({
      sendMail: sendMailMock,
    });
  });

  describe("sendEmail", () => {
    it("should throw an error if required email options are missing", async () => {
      await expectAsync(sendEmail()).toBeRejectedWithError(
        errorMessages.invalidEmailOption
      );
    });

    it("should call nodemailer with correct email options", async () => {
      const fromEmail = "test@example.com";
      const fromName = "rose kgatle";
      const toEmail = "recipient@example.com";
      const subject = "Test Subject";
      const body = "This is a test body";

      await sendEmail(fromEmail, fromName, toEmail, subject, body);

      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: subject,
        text: body,
      });
    });
  });

  describe("getRandomQuote", () => {
    it("should return a random quote from the quotes.json file", () => {
      const mockQuotes = [
        { quote: "Mock Quote 1", author: "Author 1" },
        { quote: "Mock Quote 2", author: "Author 2" },
      ];
      spyOn(fs, "readFileSync").and.returnValue(JSON.stringify(mockQuotes));

      const quote = getRandomQuote();
      expect(mockQuotes).toContain(quote);
    });
  });

  describe("validateEmail", () => {
    it("should throw an error for an invalid email address", () => {
      expect(() => validateEmail("invalid-email")).toThrowError(
        errorMessages.invalidEmail
      );
    });

    it("should not throw an error for a valid email address", () => {
      expect(() => validateEmail("test@example.com")).not.toThrow();
    });
  });

  describe("sendInspiration", () => {
    it("should send an email with a random quote", async () => {
      process.argv[2] = "test@example.com";

      const mockQuotes = [
        { quote: "Mock Quote 1", author: "Author 1" },
        { quote: "Mock Quote 2", author: "Author 2" },
      ];
      spyOn(fs, "readFileSync").and.returnValue(JSON.stringify(mockQuotes));

      await sendInspiration();

      expect(sendMailMock).toHaveBeenCalledWith(
        jasmine.objectContaining({
          to: "test@example.com",
          text: jasmine.stringMatching(/Mock Quote \d - Author \d/),
        })
      );
    });
  });
});
