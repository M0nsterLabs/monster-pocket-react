import OrdersClient from 'plasma-order-api-client-js';
import MembershipsClient from 'plasma-membership-api-client-js';
import ReviewsClient from 'plasma-reviews-api-client-js';
import advice from '../src/model/advice/Advice';
import mascotAndSocialProof from './MascotAndSocialProof';
import review from './Review';
import Memberships from './memberships';

export default {
  OrdersClient         : OrdersClient,
  MembershipsClient    : MembershipsClient,
  ReviewsClient        : ReviewsClient,
  advice               : advice,
  mascotAndSocialProof : mascotAndSocialProof,
  review               : review,
  memberships          : Memberships
};
