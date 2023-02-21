variable "name" {
  description = "Function name"
  type        = string
}

variable "source_dir" {
  description = "Function source directory"
  type        = string
}

variable "environment" {
  type        = string
  description = "Staging or production (staging/prod)"
  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "Must be one of 'staging' or 'prod'."
  }
}

variable "variables" {
  type        = map(string)
  description = "Environment variables to pass to the functions"
  default     = {}
}

variable "project_name" {
  type        = string
  description = "Name of project. e.g. limelight"
}

variable "bucket_id" {
  description = "Deployment bucket ID"
  type        = string
}

variable "role_arn" {
  description = "Execution role ARN"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}


data "archive_file" "function" {
  type = "zip"

  source_dir  = var.source_dir
  output_path = "${var.source_dir}.zip"
}

resource "aws_s3_bucket_object" "function" {
  bucket = var.bucket_id

  key    = "${var.name}.zip"
  source = data.archive_file.function.output_path

  etag = filemd5(data.archive_file.function.output_path)
}

resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.function.function_name}"
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = "${var.cognito_user_pool_arn}"
}


resource "aws_lambda_function" "function" {
  function_name = "${lower(var.project_name)}-${var.environment}-${var.name}"

  s3_bucket = var.bucket_id
  s3_key    = aws_s3_bucket_object.function.key

  runtime = "nodejs12.x"
  handler = "main.handler"

  source_code_hash = data.archive_file.function.output_base64sha256


  role = var.role_arn

  environment {
    variables = var.variables
  }
}

resource "aws_cloudwatch_log_group" "function" {
  name = "/aws/lambda/${aws_lambda_function.function.function_name}"

  retention_in_days = 30
}

output "arn" {
  description = "ARN of the created function"
  value       = aws_lambda_function.function.arn
}