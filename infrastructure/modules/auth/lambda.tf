# Step 1 - Create S3 bucket
resource "random_id" "lambda_bucket_name" {
  prefix      = "${lower(var.project_name)}-lambda-deployments-"
  byte_length = 4
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket        = lower(random_id.lambda_bucket_name.dec)
  acl           = "private"
  force_destroy = true
}

# Step 2 - Create execution role
resource "aws_iam_role" "lambda_exec" {
  name = "${title(var.project_name)}LambdaServiceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  for_each = toset([
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole", 
    "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  ])
  policy_arn = each.value
}

# FUNCTION - Post confirmation
module "post_confirmation_function" {
  source = "./modules/lambda-function"

  name         = "post-confirmation"
  source_dir   = "${path.module}/triggers/post-confirmation"
  bucket_id    = aws_s3_bucket.lambda_bucket.id
  role_arn     = aws_iam_role.lambda_exec.arn
  project_name = var.project_name
  environment  = var.environment
  variables = {
    "SQS_QUEUE_NAME" = aws_sqs_queue.queue.url
  }
  cognito_user_pool_arn = aws_cognito_user_pool.pool.arn
}