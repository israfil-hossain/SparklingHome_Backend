# Application Documentation

## Introduction

Welcome to the documentation for our application! This document provides a comprehensive overview of the application's directory structure and modules, helping developers and users understand its organization and functionalities.

## Directory Structure

- **Dockerfile**: This file contains instructions for Docker to build the application's Docker image. It specifies the environment and dependencies required to run the application within a Docker container.

- **nest-cli.json**: Configuration file for the NestJS Command Line Interface (CLI). It provides settings and options for managing the NestJS project.

- **package.json**: This manifest file holds metadata about the project, including its name, version, and dependencies. It also includes scripts for common tasks such as building and running the application.

- **README.md**: This markdown file serves as the primary documentation for the project. It provides an overview of the application and instructions for developers and users.

- **src**: This directory contains the source code of the application.

  - **app.module.ts**: The main module file responsible for bootstrapping the application. It imports and configures various modules and components required to run the application.
  - **config**: This directory houses configuration files for different aspects of the application, such as JWT authentication, database connection settings, and logging configurations.
  - **main.ts**: The entry point of the application. This file initializes and starts the NestJS application.
  - **module**: This directory contains individual modules of the application. Each module encapsulates related functionalities, such as user management, authentication, and booking services.
  - **utility**: This directory holds utility files providing additional functionalities, such as custom decorators, filters, helpers, and validators.

- **tsconfig.build.json**: This TypeScript configuration file is used specifically for building the application. It specifies compiler options and settings for the TypeScript compiler to generate the production-ready JavaScript code.

- **tsconfig.json**: This TypeScript configuration file provides settings for the TypeScript compiler. It defines compiler options, paths, and other settings used during development and building of the application.

## Modules

Our application is modularized to encapsulate related functionalities within separate modules. Here's an overview of each module:

- **Application User Module**: Manages user-related functionalities such as registration, authentication, and authorization. It provides endpoints for user management operations, including user creation, updating, and deletion.

- **Authentication Module**: Provides authentication mechanisms for user login and access control. It includes features such as token-based authentication and user authorization based on roles and permissions.

- **Cleaning Booking Module**: Handles cleaning service bookings, including scheduling, management, and payment processing. It allows users to book cleaning services, view upcoming bookings, and manage payment details.

- **Cleaning Coupon Module**: Manages discount coupon functionalities for cleaning services. Users can apply coupons during the booking process to avail discounts on cleaning services.

- **Cleaning Price Module**: Handles pricing configurations for different cleaning services. It allows administrators to set and update prices for various cleaning services based on factors such as service type, duration, and additional requirements.

- **Cleaning Subscription Module**: Manages subscription-based cleaning service offerings. Users can subscribe to recurring cleaning services, specifying frequency, duration, and other preferences.

- **Cleaning Time Slot Module**: Facilitates scheduling and management of cleaning time slots. Users can view available time slots, schedule cleaning appointments, and manage existing bookings.

- **Common Module**: Contains shared functionalities and utilities utilized across multiple modules. It includes generic components, services, and utilities used throughout the application.

- **Configuration Module**: Manages application-wide configuration settings, including environment variables, feature flags, and system settings. It provides endpoints for retrieving and updating configuration parameters at runtime.

- **Dashboard Module**: Provides dashboard functionalities for administrators and users to visualize key metrics and data related to cleaning services. It includes features such as analytics, reporting, and data visualization.

- **Email Module**: Handles email notifications and communications. It includes templates for common email notifications such as booking confirmations, payment receipts, and account notifications.

- **Encryption Module**: Provides encryption and decryption functionalities for securing sensitive data such as user passwords, authentication tokens, and payment information. It ensures data privacy and security in transit and at rest.

- **Image Meta Module**: Manages metadata associated with images used within the application. It includes features for uploading, storing, and retrieving image metadata such as size, format, and captions.

- **Payment Receive Module**: Facilitates payment processing and handling of payment events. It integrates with payment gateways to accept payments for cleaning services and manages payment-related events such as successful payments, refunds, and chargebacks.

# Core Application Operation Workflow

This section outlines the workflow of the application, detailing the sequence of operations from user interaction to service provision and scheduling.

1. **User Interaction**:

   - Users interact with the system through the provided user interface, typically a web or mobile application.

2. **Subscription Creation**:

   - Upon user subscription creation, the system adds the subscription to its database.
   - If the associated user does not exist, a new user profile is created based on the provided email.

3. **Booking Creation**:

   - A booking is automatically generated for the subscription, serving as the current booking for the user.
   - The next booking date is determined based on the subscription type and user preferences.

4. **Admin Confirmation**:

   - Admins review and confirm the booking date, triggering an email notification to inform the user.

5. **Service Provision**:

   - After service provision, users mark the booking as served within the application.

6. **Payment Request**:

   - Users receive a payment request email, prompting them to complete payment through a third-party payment gateway.

7. **Booking Completion**:

   - Upon successful payment, the booking is marked as complete, indicating the successful service delivery.

8. **Scheduler Operation**:

   - A scheduler periodically checks for upcoming bookings based on the next cleaning date stored in the user's subscription.
   - Notifications are sent to users four days before the next cleaning, with a new booking created two days before to ensure continuity.

9. **User Modifications**:
   - Users can cancel bookings or request modifications through the application interface, with the system updating booking information accordingly.

This workflow ensures a seamless user experience and efficient management of cleaning service subscriptions within the application.
