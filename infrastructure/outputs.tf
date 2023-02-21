output "user_pool_domain" {
  value       = module.auth.user_pool_domain
  description = "Cognito User Pool Domain"
}

output "user_pool_id" {
  value       = module.auth.user_pool_id
  description = "Cognito User Pool ID"
}

output "user_pool_client_id" {
  value       = module.auth.user_pool_client_id
  description = "Cognito User Pool Client ID"
}

output "user_pool_token_issuer_url" {
  value       = module.auth.user_pool_token_issuer_url
  description = "URL token issuer"
}

output "sqs_queue_url" {
  description = "URL of SQS queue"
  value       = module.auth.sqs_queue_url
}
output "sqs_queue_name" {
  description = "Name of SQS queue"
  value       = module.auth.sqs_queue_name
}

output "sqs_region" {
  value = module.auth.sqs_region
}


