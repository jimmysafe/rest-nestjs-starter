locals {
  pool_name = "${lower(var.project_name)}-${var.environment}"
}

resource "random_id" "external_id" {
  byte_length = 4
}


# Step 1 - Create domain
resource "aws_cognito_user_pool_domain" "domain" {
  domain       = local.pool_name
  user_pool_id = aws_cognito_user_pool.pool.id
}


# Step 2 - Create pool
resource "aws_cognito_user_pool" "pool" {
  name = local.pool_name

  mfa_configuration          = "OFF"
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message = file("${path.module}/templates/code-confirmation.html")
    email_subject = "Il tuo codice di verifica"
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT" 
  }


  password_policy {
    minimum_length    = 6
    require_lowercase = true
    require_numbers   = false
    require_uppercase = false
    require_symbols   = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  device_configuration {
    device_only_remembered_on_user_prompt = false
  }

  lambda_config {
    post_confirmation = module.post_confirmation_function.arn
  }

  schema {
    name                     = "phone_number"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "email"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "family_name"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "given_name"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }
}

# Step 3 - Create Client App(s)
resource "aws_cognito_user_pool_client" "client" {
  name = "${local.pool_name}-client"

  user_pool_id = aws_cognito_user_pool.pool.id

  callback_urls = var.callback_urls

  supported_identity_providers = ["COGNITO"]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 365

  token_validity_units {
    access_token  = "days"
    id_token      = "days"
    refresh_token = "days"
  }

  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid"]
  allowed_oauth_flows_user_pool_client = true
}

output "user_pool_domain" {
  value       = "https://${aws_cognito_user_pool.pool.name}.auth.${var.aws_region}.amazoncognito.com"
  description = "Cognito User Pool Domain"
}

output "user_pool_id" {
  value       = aws_cognito_user_pool.pool.id
  description = "Cognito User Pool ID"
}

output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.client.id
  description = "Cognito User Pool Client ID"
}

output "user_pool_token_issuer_url" {
    value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.pool.id}"
    description = "URL token issuer"
}