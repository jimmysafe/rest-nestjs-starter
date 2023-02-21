variable "message_retention_seconds" {
  type        = number
  description = "Seconds to retain messages"
  default     = 345600
}

variable "visibility_timeout_seconds" {
  type        = number
  description = "Seconds to lock messages to prevent other consumers from processing"
  default     = 30
}

locals {
  name = "${lower(var.project_name)}-${var.environment}-users"
}

resource "aws_sqs_queue" "queue" {
  name                       = local.name
  message_retention_seconds  = var.message_retention_seconds
  visibility_timeout_seconds = var.visibility_timeout_seconds
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_queue.arn
    maxReceiveCount     = 5
  })

  tags = {
    env = "${var.environment}"
  }
}

resource "aws_sqs_queue" "deadletter_queue" {
  name = "${local.name}-deadletter"

  tags = {
    env = "${var.environment}"
  }
}

output "sqs_region" {
    value = var.aws_region
}

output "sqs_queue_url" {
  description = "URL of SQS queue"
  value       =  aws_sqs_queue.queue.url
}
output "sqs_queue_name" {
  description = "Name of SQS queue"
  value       =  aws_sqs_queue.queue.name
}