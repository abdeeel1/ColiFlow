<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A réclamation (claim/complaint) filed by a sender or a traveler about a
 * delivery — e.g. a colis that was never delivered or that contained something
 * forbidden. Reviewed and resolved by an admin.
 */
class Reclamation extends Model
{
    protected $table = 'reclamations';

    protected $fillable = [
        'user_id',
        'against_user_id',
        'travel_request_id',
        'package_id',
        'role',
        'type',
        'subject',
        'description',
        'status',
        'admin_response',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public const TYPES = [
        'non_livraison',
        'colis_endommage',
        'contenu_suspect',
        'retard',
        'comportement',
        'autre',
    ];

    public const STATUSES = ['open', 'in_review', 'resolved', 'rejected'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function againstUser()
    {
        return $this->belongsTo(User::class, 'against_user_id');
    }

    public function travelRequest()
    {
        return $this->belongsTo(TravelRequest::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
